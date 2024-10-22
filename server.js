import express from "express";
import oracledb from "oracledb";
import cors from "cors";

const app = express();
const port = 3000;
app.use(cors());

async function connectToOracleDB() {
  let connection;

  try {
    connection = await oracledb.getConnection({
      user: "hr",
      password: "hr",
      connectString: "localhost:1521",
    });
    console.log("successfully connected to oracle database 11g");

    return connection;
  } catch (err) {
    console.log("error connection to the database", err.message);
    throw err;
  }
}

app.get("/", async (req, res) => {
  console.log("hello from server");
  res.json({ message: "amanpreet" });
});

app.get("/employees", async (req, res) => {
  let connection;
  try {
    connection = await connectToOracleDB();

    const result = await connection.execute(`
            select employee_id, first_name, last_name 
            from employees`);

    res.json(result.rows);
  } catch (err) {
    console.log("error fetching employees details ", err.message);
    res.status(500).send("error fetching employee details");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("error closign connection: ", err.message);
      } finally {
        if (connection) {
          try {
            await connection.close();
          } catch (err) {
            console.error("error closing connection ", err.message);
          }
        }
      }
    }
  }
});

app.get("/employees/:id", async (req, res) => {
  const employeeId = req.params.id;
  let connection;

  try {
    connection = await connectToOracleDB();

    const result = await connection.execute(
      `select first_name, last_name
            from employees
            where employee_id = :id`,
      [employeeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("employee not found");
    }
    res.json({ firstName: result.rows[0][0], lastName: result.rows[0][1] });
  } catch (err) {
    console.error("error fetchign employee details: ", err.message);
    res.status(500).send("error fetching employee details");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("error closing connection: ", err.message);
      }
    }
  }
});

app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});
