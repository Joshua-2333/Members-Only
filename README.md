# Members Only Club

## Project Overview

**Members Only** is a Node.js web application where users can anonymously post messages in an exclusive online clubhouse. Membership gives users additional privileges, such as seeing who authored messages and creating posts. Admin users have extra capabilities, including the ability to delete messages.

This project demonstrates authentication, authorization, and database management using PostgreSQL.

---

## Features

- **User Authentication**
  - Sign up with validation and secure password storage (bcrypt)
  - Login with Passport.js
  - Confirm password field with custom validation

- **Membership System**
  - Users sign up as non-members by default
  - Membership can be granted via a secret passcode
  - Members can see the author and timestamp of messages
  - Guests can only see the message content

- **Messages**
  - Authenticated members can create new messages
  - Each message has a title, timestamp, and text
  - Messages are displayed in styled boxes with metadata

- **Admin Controls**
  - Admin users can delete any message
  - Admin status can be set manually during signup or via a secret code

- **Frontend Features**
  - Responsive navigation and layout
  - Guest/member badges with tooltips
  - Styled forms and message boxes
  - Clean and readable interface

---

## Technologies Used

- Node.js
- Express.js
- PostgreSQL
- Passport.js (Authentication)
- bcrypt (Password hashing)
- EJS (Templating)
- HTML, CSS (Frontend)

---

## Database Models

### Users
- `firstName` (string)
- `lastName` (string)
- `username` (string, unique)
- `password` (string, hashed)
- `isMember` (boolean, default: false)
- `isAdmin` (boolean, default: false)

### Messages
- `title` (string)
- `text` (string)
- `timestamp` (datetime)
- `author` (foreign key to Users)

---

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd members-only

## Demo

https://members-only-oym0.onrender.com
