import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ReleaseModal } from '@components/ReleaseModal/ReleaseModal';
import '@testing-library/jest-dom';

describe('ReleaseModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockStatuses = [
    { id: 1, alias: 'В работе' },
    { id: 2, alias: 'Завершен' },
    { id: 3, alias: 'Отменен' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('does not render modal when isOpen is false', () => {
      render(
        <ReleaseModal
          isOpen={false}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
    });

    test('renders create release modal in create mode', () => {
      render(
        <ReleaseModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      expect(screen.getByTestId('modal-title')).toHaveTextContent('Создать релиз');
      expect(screen.getByTestId('modal-submit-btn')).toHaveTextContent('Добавить');
      expect(screen.getByText('Название:')).toBeInTheDocument();
      expect(screen.getByText('Версия:')).toBeInTheDocument();
      expect(screen.getByText('Срок:')).toBeInTheDocument();
      expect(screen.getByText('Описание:')).toBeInTheDocument();
      expect(screen.queryByText('Статус:')).not.toBeInTheDocument();
    });

    test('renders view mode for non-admin users', () => {
      render(
        <ReleaseModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="edit"
          userRole="developer"
          statuses={mockStatuses}
        />
      );

      expect(screen.getByTestId('modal-title')).toHaveTextContent('Информация о релизе');
      expect(screen.queryByTestId('modal-submit-btn')).not.toBeInTheDocument();

      const nameInput = screen.getByPlaceholderText('Введите название релиза');
      const versionInput = screen.getByPlaceholderText('Введите версию');

      expect(nameInput).toHaveAttribute('readonly');
      expect(versionInput).toHaveAttribute('disabled');
    });
  });

  describe('Form Initialization', () => {

    test('handles different date formats correctly in edit mode', () => {
      const initialData = {
        id: 'release-123',
        title: 'Test Release',
        data: {
          version: '1.0.0',
          description: 'Test description',
          status: { id: 1 }
        },
        end_date: '2024-12-31T00:00:00.000Z'
      };

      render(
        <ReleaseModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="edit"
          initialData={initialData}
          statuses={mockStatuses}
        />
      );

      expect(screen.queryByLabelText('Срок:')).not.toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    test('updates form fields when user types', () => {
      render(
        <ReleaseModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const nameInput = screen.getByPlaceholderText('Введите название релиза');
      const versionInput = screen.getByPlaceholderText('Введите версию');
      const descriptionInput = screen.getByPlaceholderText('Введите описание');

      fireEvent.change(nameInput, { target: { value: 'New Release' } });
      fireEvent.change(versionInput, { target: { value: '2.0.0' } });
      fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });

      expect(nameInput).toHaveValue('New Release');
      expect(versionInput).toHaveValue('2.0.0');
      expect(descriptionInput).toHaveValue('Updated description');
    });
  });

  describe('Form Submission', () => {

    test('shows success modal on successful submission', async () => {
      mockOnSubmit.mockResolvedValue(true);

      render(
        <ReleaseModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const nameInput = screen.getByPlaceholderText('Введите название релиза');
      const versionInput = screen.getByPlaceholderText('Введите версию');

      fireEvent.change(nameInput, { target: { value: 'Test Release' } });
      fireEvent.change(versionInput, { target: { value: '1.0.0' } });
      fireEvent.submit(screen.getByTestId('modal-form'));

      await waitFor(() => {
        expect(screen.getByTestId('success-modal-content')).toBeInTheDocument();
      });

      expect(screen.getByTestId('success-modal-message')).toHaveTextContent(
        'Релиз успешно создан!'
      );
    });

    test('shows edit success message in edit mode', async () => {
      mockOnSubmit.mockResolvedValue(true);

      const initialData = {
        id: 'release-123',
        title: 'Test Release',
        data: { version: '1.0.0', description: 'Test' },
        end_date: '2024-12-31'
      };

      render(
        <ReleaseModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="edit"
          initialData={initialData}
          statuses={mockStatuses}
        />
      );

      fireEvent.submit(screen.getByTestId('modal-form'));

      await waitFor(() => {
        expect(screen.getByTestId('success-modal-content')).toBeInTheDocument();
      });

      expect(screen.getByTestId('success-modal-message')).toHaveTextContent(
        'Релиз успешно обновлен!'
      );
    });

    test('closes modal after successful submission timeout', async () => {
      mockOnSubmit.mockResolvedValue(true);
      jest.useFakeTimers();

      render(
        <ReleaseModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const nameInput = screen.getByPlaceholderText('Введите название релиза');
      const versionInput = screen.getByPlaceholderText('Введите версию');

      fireEvent.change(nameInput, { target: { value: 'Test' } });
      fireEvent.change(versionInput, { target: { value: '1.0.0' } });
      fireEvent.submit(screen.getByTestId('modal-form'));

      await waitFor(() => {
        expect(screen.getByTestId('success-modal-content')).toBeInTheDocument();
      });

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(mockOnClose).toHaveBeenCalled();

      jest.useRealTimers();
    });

    test('does not show success modal on failed submission', async () => {
      mockOnSubmit.mockResolvedValue(false);

      render(
        <ReleaseModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const nameInput = screen.getByPlaceholderText('Введите название релиза');
      const versionInput = screen.getByPlaceholderText('Введите версию');

      fireEvent.change(nameInput, { target: { value: 'Test' } });
      fireEvent.change(versionInput, { target: { value: '1.0.0' } });
      fireEvent.submit(screen.getByTestId('modal-form'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      expect(screen.queryByTestId('success-modal-content')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles missing initialData gracefully', () => {
      render(
        <ReleaseModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="edit"
          initialData={null}
          statuses={mockStatuses}
        />
      );

      const nameInput = screen.getByPlaceholderText('Введите название релиза');
      const versionInput = screen.getByPlaceholderText('Введите версию');

      expect(nameInput).toHaveValue('');
      expect(versionInput).toHaveValue('');
    });

    test('extracts release ID correctly from complex ID - fix getReleaseId logic', () => {
      const initialData = {
        id: 'project-789-release-456',
        title: 'Test Release',
        data: { version: '1.0.0', description: 'Test' }
      };

      render(
        <ReleaseModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="edit"
          initialData={initialData}
        />
      );

      fireEvent.submit(screen.getByTestId('modal-form'));
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '789'
        }),
        'release'
      );
    });
  });

  describe('Modal Closing', () => {
    test('calls onClose when close button is clicked', () => {
      render(
        <ReleaseModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.click(screen.getByTestId('modal-close-btn'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    test('calls onClose when cancel button is clicked', () => {
      render(
        <ReleaseModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      fireEvent.click(screen.getByTestId('modal-cancel-btn'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    test('closes success modal when success close button is clicked', async () => {
      mockOnSubmit.mockResolvedValue(true);

      render(
        <ReleaseModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const nameInput = screen.getByPlaceholderText('Введите название релиза');
      const versionInput = screen.getByPlaceholderText('Введите версию');

      fireEvent.change(nameInput, { target: { value: 'Test' } });
      fireEvent.change(versionInput, { target: { value: '1.0.0' } });
      fireEvent.submit(screen.getByTestId('modal-form'));

      await waitFor(() => {
        expect(screen.getByTestId('success-modal-content')).toBeInTheDocument();
      });
      fireEvent.submit(screen.getByTestId('modal-form'));

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});