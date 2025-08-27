# MoneyTracker - Personal Finance Management App

A comprehensive Next.js 14 application for managing personal finances, tracking expenses, managing debts, and splitting group expenses. Built with TypeScript, Firebase, and Tailwind CSS.

## Features

### 🔐 Authentication
- Firebase Auth with email/password and Google sign-in
- Secure user authentication and session management
- User profile management

### 💰 Expense & Income Tracking
- Add and categorize transactions (income/expense)
- Multiple payment methods (Cash, UPI, Card, Bank Transfer)
- Transaction history with advanced filtering
- Export transactions to CSV
- Real-time balance calculations

### 📊 Debts & Dues Management
- Track what you owe and what others owe you
- Due date reminders and overdue notifications
- Debt settlement tracking
- Balance calculations and summaries

### 👥 Group Expense Splitting
- Create groups for shared expenses (trips, dinners, etc.)
- Add group members via email
- Split expenses equally or with custom amounts
- Real-time balance calculations per member
- Group expense history and summaries

### 📈 Dashboard & Analytics
- Comprehensive financial overview
- Interactive charts for expense breakdown
- Monthly income vs. expense trends
- Recent transactions and pending debts
- Weekly and monthly summaries

### 🎨 Modern UI/UX
- Clean and responsive design with Tailwind CSS
- shadcn/ui components for consistent UI
- Dark mode support with system preference detection
- Mobile-first responsive layout
- Intuitive navigation and user experience

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **State Management**: React Context API
- **Deployment Ready**: Vercel optimized

## Prerequisites

Before running this application, make sure you have:

- Node.js 18+ installed
- A Firebase project set up
- Firebase Authentication and Firestore enabled

## Firebase Setup

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication and Firestore Database

2. **Configure Authentication**:
   - In Firebase Console, go to Authentication > Sign-in method
   - Enable Email/Password and Google sign-in methods

3. **Set up Firestore**:
   - Create a Firestore database in production mode
   - The app will automatically create the required collections

4. **Get Firebase Configuration**:
   - Go to Project Settings > General > Your apps
   - Add a web app and copy the configuration

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd money-tracker-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Update `.env.local` with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Create an account or sign in to get started

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── transactions/      # Transactions management
│   ├── debts/            # Debts and dues management
│   ├── groups/           # Group expense management
│   └── profile/          # User profile management
├── components/           # Reusable React components
│   ├── ui/              # shadcn/ui components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard components
│   ├── transactions/    # Transaction components
│   ├── debts/           # Debt management components
│   ├── groups/          # Group components
│   └── layout/          # Layout components
├── contexts/            # React Context providers
├── lib/                 # Utility functions and configurations
├── providers/           # App-wide providers
└── types/              # TypeScript type definitions
```

## Key Features Explained

### Transaction Management
- **Categories**: Pre-defined categories for both income and expenses
- **Payment Methods**: Support for Cash, UPI, Card, and Bank Transfer
- **Filtering**: Advanced filters by date range, category, amount, and payment method
- **Export**: CSV export functionality for accounting and tax purposes

### Debt Tracking
- **Dual Tracking**: Track both what you owe and what others owe you
- **Due Dates**: Optional due dates with overdue notifications
- **Settlement**: Mark debts as settled when paid
- **Balances**: Automatic balance calculations and net position

### Group Expenses
- **Flexible Splitting**: Equal split or custom amounts per member
- **Member Management**: Add members via email addresses
- **Balance Tracking**: Real-time balance calculations per member
- **History**: Complete expense history with categorization

### Dashboard Analytics
- **Financial Overview**: Total income, expenses, and net balance
- **Visual Charts**: Pie charts for expense breakdown, bar charts for monthly trends
- **Recent Activity**: Latest transactions and pending debts
- **Period Summaries**: Weekly and monthly financial summaries

## Security Features

- **User Isolation**: Each user can only access their own data
- **Firebase Security Rules**: Firestore rules ensure data privacy
- **Authentication Required**: All routes protected by authentication
- **Input Validation**: Client and server-side validation

## Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile devices
- Various screen sizes and orientations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include screenshots and error messages if applicable

## Roadmap

Future enhancements planned:
- [ ] Recurring transactions
- [ ] Budget planning and tracking
- [ ] Investment portfolio tracking
- [ ] Bill reminders and notifications
- [ ] Multi-currency support
- [ ] Data backup and restore
- [ ] Advanced reporting and insights
- [ ] Mobile app (React Native)

---

Built with ❤️ using Next.js, Firebase, and modern web technologies.
