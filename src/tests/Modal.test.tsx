import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '@components/Modal/Modal';

describe('Modal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    title: 'Test Modal',
    children: <div>Modal Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  test('should render modal content when isOpen is true', () => {
    render(<Modal {...defaultProps} />);

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  test('should call onClose when close button is clicked', () => {
    render(<Modal {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: '×' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should call onClose when overlay is clicked', () => {
    render(<Modal {...defaultProps} />);

    const overlay = screen.getByTestId('modal-overlay');
    fireEvent.pointerDown(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('should not call onClose when modal content is clicked', () => {
    render(<Modal {...defaultProps} />);

    const modalContent = screen.getByText('Modal Content');
    fireEvent.click(modalContent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('should call onSubmit when form is submitted', () => {
    render(<Modal {...defaultProps} />);

    const form = screen.getByTestId("modal-form");
    fireEvent.submit(form);

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  test('should render custom submit button text', () => {
    render(<Modal {...defaultProps} submitButtonText="Custom Submit" />);

    expect(screen.getByText('Custom Submit')).toBeInTheDocument();
  });

  test('should render cancel button when showCancelButton is true', () => {
    render(<Modal {...defaultProps} showCancelButton={true} />);

    expect(screen.getByText('Отменить')).toBeInTheDocument();
  });

  test('should not render cancel button when showCancelButton is false', () => {
    render(<Modal {...defaultProps} showCancelButton={false} />);

    expect(screen.queryByText('Отменить')).not.toBeInTheDocument();
  });

  test('should render additional button when provided', () => {
    const mockAdditionalButtonClick = jest.fn();

    render(
      <Modal
        {...defaultProps}
        additionalButton={{
          text: 'Дополнительно',
          variant: 'secondary',
          onClick: mockAdditionalButtonClick,
        }}
      />
    );

    const additionalButton = screen.getByText('Дополнительно');
    expect(additionalButton).toBeInTheDocument();

    fireEvent.click(additionalButton);
    expect(mockAdditionalButtonClick).toHaveBeenCalled();
  });

  test('should render in read-only mode', () => {
    render(<Modal {...defaultProps} isReadOnly={true} />);

    expect(screen.queryByText('Отменить')).not.toBeInTheDocument();
    expect(screen.queryByText('Custom Submit')).not.toBeInTheDocument();
  });

  describe('Button variants', () => {
    test('should render primary button by default', () => {
      render(<Modal {...defaultProps} />);

      const submitButton = screen.getByText('Добавить');
      expect(submitButton).toHaveClass('btn-primary');
    });

    test('should render danger button when specified', () => {
      render(<Modal {...defaultProps} submitButtonVariant="danger" />);

      const submitButton = screen.getByText('Добавить');
      expect(submitButton).toHaveClass('btn-danger');
    });

    test('should render secondary button for additional button', () => {
      render(
        <Modal
          {...defaultProps}
          additionalButton={{
            text: 'Дополнительно',
            variant: 'secondary',
            onClick: jest.fn(),
          }}
        />
      );

      const additionalButton = screen.getByText('Дополнительно');
      expect(additionalButton).toHaveClass('btn-secondary');
    });
  });
});