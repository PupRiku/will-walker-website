import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PerusalRequestModal from '@/components/PerusalRequestModal';

// Stand in for the real widget, which needs a network-loaded Google script.
// The button lets a test solve the captcha the way a user would.
vi.mock('react-google-recaptcha', () => ({
  default: ({ onChange }: { onChange: (token: string | null) => void }) => (
    <button type="button" onClick={() => onChange('test-token')}>
      Solve captcha
    </button>
  ),
}));

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

  it('points the FormSubmit redirect at the current environment', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000');
    const { baseElement } = render(
      <PerusalRequestModal isOpen={true} onClose={vi.fn()} playTitle="Test Play" />
    );

    expect(baseElement.querySelector('input[name="_next"]')).toHaveValue(
      'http://localhost:3000/thank-you'
    );
    vi.unstubAllEnvs();
  });

  it('keeps submit disabled until the captcha is solved', async () => {
    render(
      <PerusalRequestModal
        isOpen={true}
        onClose={vi.fn()}
        playTitle="Test Play"
      />
    );
    expect(screen.getByRole('button', { name: 'Send Request' })).toBeDisabled();

    fireEvent.click(await screen.findByRole('button', { name: 'Solve captcha' }));

    expect(screen.getByRole('button', { name: 'Send Request' })).toBeEnabled();
    expect(screen.getByText('Ready to send.')).toBeInTheDocument();
  });

  it('re-arms the captcha gate when the dialog is reopened', async () => {
    const { rerender } = render(
      <PerusalRequestModal isOpen={true} onClose={vi.fn()} playTitle="Test Play" />
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Solve captcha' }));
    expect(screen.getByRole('button', { name: 'Send Request' })).toBeEnabled();

    rerender(
      <PerusalRequestModal isOpen={false} onClose={vi.fn()} playTitle="Test Play" />
    );
    rerender(
      <PerusalRequestModal isOpen={true} onClose={vi.fn()} playTitle="Test Play" />
    );

    expect(screen.getByRole('button', { name: 'Send Request' })).toBeDisabled();
  });
});
