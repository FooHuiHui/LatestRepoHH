CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    age INT,
    birthdate DATE
);

CREATE TABLE food_items (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    food_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL CHECK(quantity >= 0),
    expiry_date DATE NOT NULL,
    consumed_quantity INT DEFAULT 0 CHECK(consumed_quantity >= 0),
    reminder_days INT DEFAULT 3 CHECK(reminder_days >= 0)
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

