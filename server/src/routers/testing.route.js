import express from "express"
import { testing1, getTesting , updatedData, deleteData} from "../controllers/testing.controller.js"

const testingRouter  = express.Router()

//POST api/testing/testing1

testingRouter.post('/testing1', testing1);
testingRouter.get("/getTesting", getTesting);
testingRouter.patch("/updateData", updatedData);
testingRouter.delete("/deleteData", deleteData);

//get the params in route
testingRouter.get("/getparam/:id", (req, res) => {
    const id = req.params.id;
    res.send(`The id is ${id}`)
})

export default testingRouter;