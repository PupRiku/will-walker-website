import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PerusalRequestModal from '@/components/PerusalRequestModal';

describe('PerusalRequestModal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <PerusalRequestModal
        isOpen={false}
        onClose={vi.fn()}
        playTitle="Test Play"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the heading and play title when open', () => {
    render(
      <PerusalRequestModal
        isOpen={true}
        onClose={vi.fn()}
        playTitle="Test Play"
      />
    );
    expect(
      screen.getByRole('heading', { name: 'Request Perusal Copy' })
    ).toBeInTheDocument();
    expect(screen.getByText('Test Play')).toBeInTheDocument();
  });

  it('renders Name and Email fields', () => {
    render(
      <PerusalRequestModal
        isOpen={true}
        onClose={vi.fn()}
        playTitle="Test Play"
      />
    );
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <PerusalRequestModal
        isOpen={true}
        onClose={onClose}
        playTitle="Test Play"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn();
    render(
      <PerusalRequestModal
        isOpen={true}
        onClose={onClose}
        playTitle="Test Play"
      />
    );
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders a submit button labeled "Send Request"', () => {
    render(
      <PerusalRequestModal
        isOpen={true}
        onClose={vi.fn()}
        playTitle="Test Play"
      />
    );
    const submit = screen.getByRole('button', { name: 'Send Request' });
    expect(submit).toBeInTheDocument();
    expect(submit).toHaveAttribute('type', 'submit');
  });
});
