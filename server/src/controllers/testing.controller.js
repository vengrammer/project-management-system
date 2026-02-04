import Testing from "../model/Testing.js";

//inserting data
const testing1 = async (req,res) => {
    try{
        const { testing, nametesting } = req.body;
        if(!testing || !nametesting){
            return res.status(400).json({message: "All fields are required"});
        }
        const testingdata = await Testing.create({testing, nametesting});
        res.status(201).json(testingdata);
        console.log("testing send successfully");
    }catch(error){
        res.status(500).json({ message: error.message });
    }
}
//get the all the data
const getAllTesting = async (req, res) => {
    try{
        const testings = await Testing.find();
        res.status(200).json(testings)
    }catch(error){
        res.status(500).json({message: error.message})
    }
}
//get the specific data
const getTesting = async (req, res) => {
  try {
    const testings = await Testing.findOne({ testing: "2ksadlkjsd" });
    res.status(200).json(testings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//update specific data
const updatedData = async (req, res) => {
    const {id, newnametesting} = req.body;
    
    if (!id || !newnametesting) {
      return res
        .status(400)
        .json({ message: "ID and newnametesting are required" });
    }
    try{
        const updateData = await Testing.findOneAndUpdate(
          { _id: id },
          { nametesting: newnametesting },
          {new: true}
        );
        if(!updateData){
            return res.status(404).json({message: "the data is not found"});
        }
        res.status(200).json(updateData);
    }catch(error){
        res.status(500).json({message: "error.message"})
    }
}
//delete student
const deleteData = async (req, res) => {
    const {id} = req.body;
    console.log("request", req.body)
  try {
    await Testing.findOneAndDelete({ _id: id });
    res.status(204).json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { testing1, getTesting, updatedData, deleteData, getAllTesting };