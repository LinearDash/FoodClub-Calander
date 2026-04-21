# FoodClub WA

A premium, modern event and culinary management platform built with a focus on ease of use, visual excellence, and mobile responsiveness.

## 🚀 Project Overview

Foodclub WA is a monorepo built using **Turborepo**, designed to handle event scheduling, task tracking, and document management for culinary professionals. The platform features a sophisticated "Culinary Curator" design system, ensuring a premium feel across all devices.

## 🏗️ Architecture

The project is structured as a monorepo using **pnpm workspaces**:

### Apps
- **`apps/web`**: A high-performance Next.js application (App Router) serving as the main dashboard.
- **`apps/mobile`**: An Expo-based mobile application shell for future expansion.

### Packages
- **`packages/types`**: Shared TypeScript definitions and interfaces.
- **`packages/utils`**: Common utility functions, formatting helpers, and design system tokens.
- **`packages/ui`**: Shared UI component library.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend**: [Supabase](https://supabase.com/) (Auth, Database, Storage)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Monorepo Tooling**: [Turborepo](https://turbo.build/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## ✨ Key Features

### 📅 Calendar Dashboard
- Interactive monthly grid view for easy event visualization.
- Modularized components (`Calendar`, `MonthlyOverview`, `EventModal`) for better maintainability.
- Status-based color coding for at-a-glance status updates.

### 📋 Event Management
- Comprehensive list view of all events.
- Advanced filtering and search capabilities.
- Integrated `EventModal` for consistent editing and previewing.

### 📁 Document Management
- Global document storage powered by Supabase Storage.
- Drag-and-drop file upload interface.
- Inline preview for images and PDFs.
- Ability to link documents directly to events.

### ✅ Task Tracking
- Per-event task management system.
- Real-time status updates and priority markers.

### 👤 User Profiles & Auth
- Secure authentication via Supabase Auth.
- Dynamic user profiles with automatic initials generation and profile-aligned naming.

## 🚦 Getting Started

### Prerequisites
- Node.js >= 18
- pnpm

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
pnpm install
```

### Development
```bash
# Run all apps and packages in development mode
pnpm dev
```

### Build
```bash
# Build all apps and packages for production
pnpm build
```

## 🎨 Design Philosophy
The "Culinary Curator" design system focuses on:
- **Premium Aesthetics**: Vibrant colors, dark mode support, and glassmorphism.
- **Responsive Layouts**: Seamless transition between desktop grids and mobile bottom sheets.
- **Micro-animations**: Subtle interactions that make the UI feel alive and responsive.

---

Built with ❤️ by the FoodClub Team.
