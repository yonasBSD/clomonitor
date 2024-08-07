import { render, screen, waitFor } from '@testing-library/react';
import { mocked } from 'jest-mock';
import { BrowserRouter as Router } from 'react-router-dom';

import API from '../../api';
import { Project } from '../../types';
import Search from './index';
jest.mock('../../api');

const getMockSearch = (fixtureId: string): { items: Project[]; 'Pagination-Total-Count': string } => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(`./__fixtures__/index/${fixtureId}.json`) as { items: Project[]; 'Pagination-Total-Count': string };
};

const defaultProps = {
  scrollPosition: 0,
  setScrollPosition: jest.fn(),
  setInvisibleFooter: jest.fn(),
};

describe('Project detail index', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let dateNowSpy: any;

  beforeEach(() => {
    dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 1634968825000);
  });

  afterAll(() => {
    dateNowSpy.mockRestore();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates snapshot', async () => {
    const mockSearch = getMockSearch('1');
    mocked(API).searchProjects.mockResolvedValue(mockSearch);

    const { asFragment } = render(
      <Router>
        <Search {...defaultProps} />
      </Router>
    );

    await waitFor(() => {
      expect(API.searchProjects).toHaveBeenCalledTimes(1);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Render', () => {
    it('renders component', async () => {
      const mockSearch = getMockSearch('1');
      mocked(API).searchProjects.mockResolvedValue(mockSearch);

      render(
        <Router>
          <Search {...defaultProps} />
        </Router>
      );

      await waitFor(() => {
        expect(API.searchProjects).toHaveBeenCalledTimes(1);
        expect(API.searchProjects).toHaveBeenCalledWith({
          filters: {},
          limit: 20,
          offset: 0,
          sort_by: 'name',
          sort_direction: 'asc',
          text: undefined,
        });
      });

      expect(screen.getAllByRole('listitem')).toHaveLength(4);
    });

    it('renders placeholder when list is empty', async () => {
      const mockSearch = getMockSearch('2');
      mocked(API).searchProjects.mockResolvedValue(mockSearch);

      render(
        <Router>
          <Search {...defaultProps} />
        </Router>
      );

      await waitFor(() => {
        expect(API.searchProjects).toHaveBeenCalledTimes(1);
      });

      expect(screen.getByText(/We're sorry!/)).toBeInTheDocument();
      expect(screen.getByText(/We can't seem to find any projects that match your search/)).toBeInTheDocument();
    });
  });
});
