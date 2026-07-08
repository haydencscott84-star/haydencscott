// netlify/functions/create-checkout-session.js
//
// Creates a Stripe Checkout Session for a custom, user-entered amount.
// The secret key is read from the STRIPE_SECRET_KEY environment variable
// (set this in Netlify: Site settings > Environment variables). Never put
// the secret key directly in this file or commit it to version control.

const Stripe = require('stripe');

const MIN_AMOUNT_USD = 5; // keep in sync with the minimum enforced on the form

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server is not configured with a Stripe secret key.' }),
    };
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { amount, note } = JSON.parse(event.body || '{}');

    const dollars = Number(amount);
    const trimmedNote = typeof note === 'string' ? note.trim() : '';

    if (!Number.isFinite(dollars) || dollars < MIN_AMOUNT_USD) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Amount must be at least $${MIN_AMOUNT_USD}.` }),
      };
    }

    if (!trimmedNote) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Please add a note describing what this payment is for.' }),
      };
    }

    const siteUrl = process.env.URL || `https://${event.headers.host}`;
    const cents = Math.round(dollars * 100);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: cents,
            product_data: {
              name: 'Payment to Hayden C. Scott',
              description: trimmedNote.slice(0, 500),
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        note: trimmedNote.slice(0, 500),
      },
      success_url: `${siteUrl}/thank-you.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pay.html?canceled=true`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('Stripe checkout session error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Something went wrong creating the payment session.' }),
    };
  }
};
