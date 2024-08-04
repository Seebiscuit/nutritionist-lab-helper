# Nutritionist Lab Helper

## Overview

Nutritionist Lab Helper is a web application designed to assist nutritionists in managing patient lab data, notes, and snippets. It provides functionality for viewing and analyzing lab results, writing patient notes with the help of a snippet dictionary, and managing patient groups.

## Features

- Patient management and grouping
- Lab data visualization and annotation
- Note-taking with snippet insertion
- Snippet dictionary management
- CSV upload for lab data

## Technology Stack

- Next.js with TypeScript
- React
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- React Query

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or later)
- npm (v6 or later)
- PostgreSQL

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/nutritionist-lab-helper.git
   cd nutritionist-lab-helper
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/nutritionist_lab_helper?schema=public"
   ```
   Replace `username`, `password`, and `nutritionist_lab_helper` with your PostgreSQL credentials and desired database name.

4. Set up the database:
   ```
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This project is designed to be deployed on Vercel. Follow these steps for deployment:

1. Push your code to a GitHub repository.
2. Connect your GitHub repository to Vercel.
3. Set up a Vercel Postgres database (see project documentation for detailed instructions).
4. Configure environment variables in Vercel project settings.
5. Deploy the project.

## Usage

1. Navigate to the Labs page (default landing page).
2. Use the PatientList component to select patients or create patient groups.
3. View and interact with lab data in the LabTable component.
4. Toggle the Notes component to view and edit patient notes.
5. Use the SnippetsDictionary page to manage snippets for quick insertion into notes.
6. To upload new lab data, use the API endpoint `/api/upload-labs` with a POST request containing the CSV data.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

If you encounter any problems or have any questions, please open an issue in the GitHub repository.