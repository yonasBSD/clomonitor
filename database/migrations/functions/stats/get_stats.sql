-- Returns some stats in json format.
create or replace function get_stats(p_foundation text)
returns json as $$
    set local timezone to 'utc';

    with ratings as (
        select p.maturity, p.rating, count(*) as total
        from project p
        where p.rating is not null
        and p.foundation_id = p_foundation
        group by p.maturity, p.rating
    )
    select json_strip_nulls(json_build_object(
        'generated_at', floor(extract(epoch from current_timestamp) * 1000),
        'snapshots', (
            select json_agg(s.date)
            from (
                select date
                from stats_snapshot
                where foundation_id = p_foundation
                order by date desc
            ) s
        ),
        'projects', json_build_object(
            'running_total', (
                select json_agg(json_build_array(
                    floor(extract(epoch from projects_month) * 1000),
                    running_total
                ))
                from (
                    select
                        projects_month,
                        sum(total) over (order by projects_month asc) as running_total
                    from (
                        select
                            date_trunc('month', p.accepted_at) as projects_month,
                            count(*) as total
                        from project p
                        where p.accepted_at is not null
                        and p.foundation_id = p_foundation
                        group by date_trunc('month', p.accepted_at)
                    ) mt
                ) rt
            ),
            'accepted_distribution', (
                select json_agg(row_to_json(entry_count))
                from (
                    select
                        extract('year' from p.accepted_at) as year,
                        extract('month' from p.accepted_at) as month,
                        count(*) as total
                    from project p
                    where p.accepted_at is not null
                    and p.foundation_id = p_foundation
                    group by
                        extract('year' from p.accepted_at),
                        extract('month' from p.accepted_at)
                    order by year desc, month desc
                ) entry_count
            ),
            'rating_distribution', (
                select json_object_agg(maturity, rating_totals)
                from (
                    (
                        select
                            'all' as maturity,
                            jsonb_agg(jsonb_build_object(rating, total)) as rating_totals
                        from (
                            select rating, sum(total) as total
                            from ratings
                            group by rating
                            order by rating asc
                        ) as all_rating_totals
                    )
                    union
                    (
                        select
                            maturity,
                            jsonb_agg(jsonb_build_object(rating, total)) as rating_totals
                        from (
                            select maturity, rating, sum(total) as total
                            from ratings
                            where maturity is not null
                            group by maturity, rating
                            order by maturity, rating asc
                        ) as maturity_rating_totals
                        group by maturity
                        order by maturity asc
                    )
                ) as rating_distribution
            ),
            'sections_average', (
                select json_object_agg(maturity, sections_average)
                from (
                    (
                        select
                            'all' as maturity,
                            (
                                select jsonb_build_object(
                                    'documentation', (average_section_score(p_foundation, 'documentation', null)),
                                    'license', (average_section_score(p_foundation, 'license', null)),
                                    'best_practices', (average_section_score(p_foundation, 'best_practices', null)),
                                    'security', (average_section_score(p_foundation, 'security', null)),
                                    'legal', (average_section_score(p_foundation, 'legal', null))
                                ) as sections_average
                            )
                        from project
                    )
                    union
                    (
                        select
                            distinct maturity,
                            (
                                select jsonb_build_object(
                                    'documentation', (average_section_score(p_foundation, 'documentation', maturity)),
                                    'license', (average_section_score(p_foundation, 'license', maturity)),
                                    'best_practices', (average_section_score(p_foundation, 'best_practices', maturity)),
                                    'security', (average_section_score(p_foundation, 'security', maturity)),
                                    'legal', (average_section_score(p_foundation, 'legal', maturity))
                                ) as sections_average
                            )
                        from project
                        where maturity is not null
                    )
                ) sections_average
            ),
            'views_daily', (
                select json_agg(json_build_array(extract(epoch from day)*1000, total))
                from (
                    select pv.day, sum(pv.total) as total
                    from project_views pv
                    join project p using (project_id)
                    where pv.day >= current_date - '1 month'::interval
                    and p.foundation_id = p_foundation
                    group by day
                    order by day asc
                ) dt
            ),
            'views_monthly', (
                select json_agg(json_build_array(extract(epoch from month)*1000, total))
                from (
                    select date_trunc('month', pv.day) as month, sum(pv.total) as total
                    from project_views pv
                    join project p using (project_id)
                    where pv.day >= current_date - '2 year'::interval
                    and p.foundation_id = p_foundation
                    group by month
                    order by month asc
                ) mt
            )
        ),
        'repositories', json_build_object(
            'passing_check', json_build_object(
                'documentation', json_build_object(
                    'adopters', repositories_passing_check(p_foundation, 'documentation', 'adopters'),
                    'changelog', repositories_passing_check(p_foundation, 'documentation', 'changelog'),
                    'code_of_conduct', repositories_passing_check(p_foundation, 'documentation', 'code_of_conduct'),
                    'contributing', repositories_passing_check(p_foundation, 'documentation', 'contributing'),
                    'governance', repositories_passing_check(p_foundation, 'documentation', 'governance'),
                    'maintainers', repositories_passing_check(p_foundation, 'documentation', 'maintainers'),
                    'readme', repositories_passing_check(p_foundation, 'documentation', 'readme'),
                    'roadmap', repositories_passing_check(p_foundation, 'documentation', 'roadmap'),
                    'summary_table', repositories_passing_check(p_foundation, 'documentation', 'summary_table'),
                    'website', repositories_passing_check(p_foundation, 'documentation', 'website')
                ),
                'license', json_build_object(
                    'license_approved', repositories_passing_check(p_foundation, 'license', 'license_approved'),
                    'license_scanning', repositories_passing_check(p_foundation, 'license', 'license_scanning'),
                    'license_spdx_id', repositories_passing_check(p_foundation, 'license', 'license_spdx_id')
                ),
                'best_practices', json_build_object(
                    'analytics', repositories_passing_check(p_foundation, 'best_practices', 'analytics'),
                    'artifacthub_badge', repositories_passing_check(p_foundation, 'best_practices', 'artifacthub_badge'),
                    'cla', repositories_passing_check(p_foundation, 'best_practices', 'cla'),
                    'community_meeting', repositories_passing_check(p_foundation, 'best_practices', 'community_meeting'),
                    'dco', repositories_passing_check(p_foundation, 'best_practices', 'dco'),
                    'github_discussions', repositories_passing_check(p_foundation, 'best_practices', 'github_discussions'),
                    'openssf_badge', repositories_passing_check(p_foundation, 'best_practices', 'openssf_badge'),
                    'openssf_scorecard_badge', repositories_passing_check(p_foundation, 'best_practices', 'openssf_scorecard_badge'),
                    'recent_release', repositories_passing_check(p_foundation, 'best_practices', 'recent_release'),
                    'slack_presence', repositories_passing_check(p_foundation, 'best_practices', 'slack_presence')
                ),
                'security', json_build_object(
                    'binary_artifacts', repositories_passing_check(p_foundation, 'security', 'binary_artifacts'),
                    'code_review', repositories_passing_check(p_foundation, 'security', 'code_review'),
                    'dangerous_workflow', repositories_passing_check(p_foundation, 'security', 'dangerous_workflow'),
                    'dependencies_policy', repositories_passing_check(p_foundation, 'security', 'dependencies_policy'),
                    'dependency_update_tool', repositories_passing_check(p_foundation, 'security', 'dependency_update_tool'),
                    'maintained', repositories_passing_check(p_foundation, 'security', 'maintained'),
                    'sbom', repositories_passing_check(p_foundation, 'security', 'sbom'),
                    'security_insights', repositories_passing_check(p_foundation, 'security', 'security_insights'),
                    'security_policy', repositories_passing_check(p_foundation, 'security', 'security_policy'),
                    'signed_releases', repositories_passing_check(p_foundation, 'security', 'signed_releases'),
                    'token_permissions', repositories_passing_check(p_foundation, 'security', 'token_permissions')
                ),
                'legal', json_build_object(
                    'trademark_disclaimer', repositories_passing_check(p_foundation, 'legal', 'trademark_disclaimer')
                )
            )
        )
    ));
$$ language sql;
