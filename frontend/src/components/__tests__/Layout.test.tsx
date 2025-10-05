import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';

// Mock Ant Design components
vi.mock('antd', () => ({
  Layout: {
    Header: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
    Content: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
    Footer: ({ children }: { children: React.ReactNode }) => <footer>{children}</footer>,
  },
  Menu: ({ children }: { children: React.ReactNode }) => <nav>{children}</nav>,
  Typography: {
    Title: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
    Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  },
}));

describe('Layout Component', () => {
  it('renders layout with title', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByText('ExoQuest Platform')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders NASA disclaimer in footer', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByText(/NASA does not endorse/)).toBeInTheDocument();
  });
});
