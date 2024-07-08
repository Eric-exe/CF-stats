const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/user", require("./routes/userRoutes"));

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const PORT = 3000;
app.listen(PORT, async () => {
    // create metadata if it doesn't exist
    await prisma.Metadata.upsert({
        where: { key: "meta" },
        create: { key: "meta" },
        update: {},
    });

    console.log(`Server is running on http://localhost:${PORT}`);
});