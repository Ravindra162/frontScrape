# Node.js News Scraper Application

This is a Node.js application for scraping news articles, storing them in a database, and broadcasting updates to WebSocket clients in real-time. The application also provides REST API endpoints for retrieving the latest news.

## Features

* Scheduled scraping of news articles every 4 minutes.
* Storage of news articles in a database.
* Real-time updates via WebSocket to connected clients.
* REST API to fetch the latest news articles.

## Prerequisites

### Software Requirements
* Node.js (v14 or higher)
* npm (Node Package Manager)
* MySQL or MariaDB database

### Environment Variables
Create a `.env` file in the root directory of the project and add the following variables:

```
PORT=3001                    # Port number for the server to run
DB_HOST=localhost            # Database host
DB_USER=root                # Database username
DB_PASSWORD=your_password    # Database password
DB_NAME=news_db             # Name of the database
```

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/news-scraper.git
cd news-scraper
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure the Database
1. Create a database named `news_db` (or the name you set in your `.env` file).
2. Run the SQL script to initialize the required tables. Example:

```sql
CREATE TABLE stories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Start the Application
```bash
npm start
```

This will start the server on the port specified in the `.env` file (default is `3001`).

## API Endpoints

### Base URL
```
http://localhost:3001
```

### 1. Health Check
* **URL:** `/`
* **Method:** `GET`
* **Response:**
```json
{
  "msg": "Scraper"
}
```

### 2. Get Latest News
* **URL:** `/news`
* **Method:** `GET`
* **Response:**
```json
[
  {
    "id": 1,
    "title": "Example News Title",
    "url": "https://example.com/news",
    "created_at": "2025-01-17T10:00:00.000Z"
  }
]
```

## WebSocket Support

The application uses WebSocket to provide real-time updates.

* **WebSocket URL:** `ws://localhost:3001`
* **Message Types:**
  * **Initial Connection:**
  ```json
  {
    "type": "initial",
    "recentStoriesCount": 30
  }
  ```
  * **Updates:**
  ```json
  {
    "type": "update",
    "stories": [
      {
        "id": 1,
        "title": "Example News Title",
        "url": "https://example.com/news",
        "created_at": "2025-01-17T10:00:00.000Z"
      }
    ]
  }
  ```

## Folder Structure
```
.
├── utils
│   ├── db.js            # Database initialization and query logic
│   ├── scrape.js        # Scraping logic for fetching news
├── .env                 # Environment variables
├── index.js            # Main entry point of the application
├── package.json        # Project metadata and dependencies
```

## Troubleshooting

### 1. WebSocket Connection Errors
* Ensure the WebSocket server is running on the specified `PORT`.
* Confirm that the frontend WebSocket URL matches `ws://localhost:3001`.

### 2. Database Errors
* Verify database credentials in the `.env` file.
* Check if the `stories` table exists in the database.
