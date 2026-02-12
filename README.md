


<div align="center">
<img width="200" alt="Image" src="https://github.com/user-attachments/assets/8b617791-cd37-4a5a-8695-a7c9018b7c70" />
<br>
<br>
<h1>Onramp Embedded Quickstart</h1>

<div align="center">
<a href="https://www.crossmint.com/quickstarts">All Quickstarts</a> | <a href="https://docs.crossmint.com/payments/embedded/quickstarts/onramp">Onramp Embedded Docs</a>
</div>

<br>
<br>
</div>

## Introduction
Create and fund a crypto wallet using Crossmint Onramp with embedded checkout. This quickstart demonstrates creating an order and using Crossmint's embedded checkout component to handle KYC, payment collection, and delivery automatically.

### Key features
- Accept fiat payments via credit and debit cards
- Create an onramp order
- Embedded checkout handles KYC, payment, and delivery automatically
- Deliver funds directly to a buyer's wallet
- Simple integration with minimal code

## Deploy
Easily deploy the template to Vercel with the button below. You will need to set the required environment variables in the Vercel dashboard.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FCrossmint%2Fonramp-embedded-quickstart&env=NEXT_PUBLIC_CROSSMINT_CLIENT_SIDE_API_KEY,NEXT_PUBLIC_CROSSMINT_ENV)

## Setup
1. Clone the repository and navigate to the project folder:
```bash
git clone https://github.com/crossmint/onramp-embedded-quickstart.git && cd onramp-embedded-quickstart
```

2. Install all dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up the environment variables:
```bash
cp .env.template .env
```

4. Get a Crossmint [client-side API key](https://docs.crossmint.com/introduction/platform/api-keys/client-side) and add it to the `.env` file. Ensure it has the scopes: `orders.read` and `orders.create`. In staging environment, all scopes are enabled by default. The following variables are used by this project:
```bash
NEXT_PUBLIC_CROSSMINT_CLIENT_SIDE_API_KEY=your_client_api_key

# staging | production
NEXT_PUBLIC_CROSSMINT_ENV=staging
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Using in production
1. Create a [production client-side API key](https://docs.crossmint.com/introduction/platform/api-keys/client-side) and set `NEXT_PUBLIC_CROSSMINT_ENV=production`.

## How it works
1. **Order Creation**: The app creates an onramp order directly via the Crossmint Orders API using the client-side API key
2. **Embedded Checkout**: Once the order is created, pass the orderId and clientSecret information to the Crossmint's embedded checkout component, which handles:
   - KYC verification (when required)
   - Payment collection
   - Order fulfillment and delivery to the recipient wallet
