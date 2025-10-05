import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Ant Design components for testing
vi.mock('antd', () => ({
  Layout: {
    Header: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
    Content: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
    Footer: ({ children }: { children: React.ReactNode }) => <footer>{children}</footer>,
  },
  Menu: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
  Typography: {
    Title: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    Paragraph: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  Card: ({ children, title, ...props }: any) => (
    <div {...props}>
      {title && <h2>{title}</h2>}
      {children}
    </div>
  ),
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
  ConfigProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  App: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Plotly
vi.mock('plotly.js-dist-min', () => ({
  default: {
    newPlot: vi.fn(),
    downloadImage: vi.fn(),
  },
}));

// Mock API client
vi.mock('./lib/api', () => ({
  apiClient: {
    uploadDataset: vi.fn(),
    predictTabular: vi.fn(),
    predictCurve: vi.fn(),
    predictFuse: vi.fn(),
    startTraining: vi.fn(),
    getJobStatus: vi.fn(),
    getModelMetrics: vi.fn(),
    submitFeedback: vi.fn(),
    getDatasets: vi.fn(),
    healthCheck: vi.fn(),
  },
}));
