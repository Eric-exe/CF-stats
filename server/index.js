const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/user", require("./routes/userRoutes"));
app.use("/problems", require("./routes/problemsRoutes"));

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const Data = require("./core/data");

const PORT = 3000;
app.listen(PORT, async () => {
    // create metadata if it doesn't exist
    await prisma.Metadata.upsert({
        where: { key: "meta" },
        create: { key: "meta" },
        update: {},
    });
    console.log("Updating problems data...");
    await Data.updateProblemsData();

    console.log(`Server is running on http://localhost:${PORT}`);
});