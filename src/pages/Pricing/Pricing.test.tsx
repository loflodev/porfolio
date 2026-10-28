import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Pricing from './Pricing';
import i18n from '../../lib/i18n';
import { createCheckoutSession, verifyCheckoutSession } from '../../services/api/checkout';
import { renderWithProviders } from '../../test/renderWithProviders';

vi.mock('../../services/api/checkout', () => ({
  createCheckoutSession: vi.fn(),
  verifyCheckoutSession: vi.fn(),
}));

const create = vi.mocked(createCheckoutSession);
const verify = vi.mocked(verifyCheckoutSession);

afterEach(() => {
  vi.resetAllMocks();
});

const dialogNamed = (key: string) =>
  screen.findByRole('dialog', { name: i18n.t(`pricingPage.${key}`) });

describe('Pricing page', () => {
  it('lists plans as level-2 headings with a contact link for enterprise', () => {
    renderWithProviders(<Pricing />, { route: '/pricing' });

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3);
    expect(screen.getByRole('link', { name: "Let's Discuss" })).toHaveAttribute('href', '/contact');
  });

  it('invites unsure visitors to book a free consultation', () => {
    renderWithProviders(<Pricing />, { route: '/pricing' });

    expect(screen.getByText(/requirements or scope/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Book a free consultation' })).toHaveAttribute(
      'href',
      '/contact'
    );
  });

  it('shows the success dialog when a returning session verifies', async () => {
    verify.mockResolvedValue(true);
    renderWithProviders(<Pricing />, { route: '/pricing?checkout=success&session_id=cs_test_1' });

    expect(await dialogNamed('checkoutSuccessTitle')).toHaveAttribute('open');
    expect(verify).toHaveBeenCalledWith('cs_test_1');
  });

  it('shows the error dialog when verification fails', async () => {
    verify.mockResolvedValue(false);
    renderWithProviders(<Pricing />, { route: '/pricing?checkout=success&session_id=cs_test_1' });

    expect(await dialogNamed('checkoutErrorTitle')).toHaveAttribute('open');
  });

  it('shows the error dialog without verifying when the session id is missing', async () => {
    renderWithProviders(<Pricing />, { route: '/pricing?checkout=success' });

    expect(await dialogNamed('checkoutErrorTitle')).toHaveAttribute('open');
    expect(verify).not.toHaveBeenCalled();
  });

  it('shows the cancelled dialog', async () => {
    renderWithProviders(<Pricing />, { route: '/pricing?checkout=cancelled' });

    expect(await dialogNamed('checkoutCancelledTitle')).toHaveAttribute('open');
  });

  it('starts checkout with the plan, a stable idempotency key and the UI locale', async () => {
    const user = userEvent.setup();
    create.mockResolvedValue({ success: false, error: 'nope' });
    renderWithProviders(<Pricing />, { route: '/pricing' });

    const [firstCheckout] = screen
      .getAllByRole('button')
      .filter((button) => button.classList.contains('pricing-btn'));
    await user.click(firstCheckout);

    await waitFor(() => expect(create).toHaveBeenCalledOnce());
    const [plan, key, locale] = create.mock.calls[0];
    expect(plan).toBe('essential');
    expect(locale).toBe('en');
    expect(JSON.parse(sessionStorage.getItem('checkout_idem_essential')!).key).toBe(key);

    // A failed attempt keeps the key so a retry is deduplicated by Stripe.
    expect(await dialogNamed('checkoutErrorTitle')).toHaveAttribute('open');
    expect(firstCheckout).toBeEnabled();
  });
});
