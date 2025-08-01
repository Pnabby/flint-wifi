require('dotenv').config({path:'../.env'});
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve frontend files
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// API: Initialize Paystack payment
app.post('/api/init-payment', async (req, res) => {
  const { email, planType } = req.body;
  const plan = {
    daily: 4,
    weekly: 25,
    monthly: 100
  }[planType];

  if (!plan) return res.status(400).json({ error: "Invalid plan" });

  res.json({
    key: process.env.PAYSTACK_PUBLIC_KEY, // Frontend uses this to initialize Paystack
    email,
    amount: plan * 100,
    reference: 'FLINT-' + Math.floor(Math.random() * 1000000000),
    metadata: { plan_type: planType }
  });
});

// API: Verify payment & fetch WiFi credentials
app.post('/api/verify-payment', async (req, res) => {
  const { reference, email, planType, amount } = req.body;

  try {
    // Verify with Paystack (server-side)
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Fetch WiFi credentials from Supabase
    const { data, error } = await supabase.rpc(
      'process_transaction_and_delete_login',
      {
        p_payment_ref: reference,
        p_customer_email: email,
        p_plan_type: planType,
        p_amount: amount
      }
    );

    if (error) throw error;

    // Send email via EmailJS (server-side)
    const emailjsResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        template_params: {
          email,
          username: data[0].username,
          password: data[0].password,
          plan: planType
        }
      })
    });

    if (!emailjsResponse.ok) {
      console.error("Email sending failed (but credentials were generated)");
    }

    res.json({ success: true, credentials: data[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
