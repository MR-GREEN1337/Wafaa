import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400,
    })
  }

  // Handle specific event type, e.g., user.created
  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;
  
    // Get the email prefix if first and last name are missing
    const email = email_addresses[0].email_address;
    const name = (first_name || last_name)
      ? `${first_name ? first_name : ''} ${last_name ? last_name : ''}`.trim()
      : email.split('@')[0]; // Use email prefix if no name provided
  
    try {
      // Create user in the database
      await prisma.user.create({
        data: {
          id: id,
          email: email,
          name: name,
        },
      });
      console.log(`User created with ID: ${id}`);
    } catch (error) {
      console.error('Error creating user in the database:', error);
      return new Response('Error occurred while creating user', {
        status: 500,
      });
    }
  }
  // Log the webhook payload
  console.log('Webhook body:', body)

  return new Response('Webhook processed', { status: 200 })
}
