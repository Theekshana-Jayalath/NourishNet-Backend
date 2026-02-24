import Application from "../models/applicationModel.js";

//Create

export const createApplication = async (req, res) => {
    try{
        const applicationData = new Application(req.body);
        const { email } = applicationData;

        const applicationExist = await Application.findOne({ email });
        if (applicationExist) {
            return res.status(400).json({ message: "Application already exists" });
        }

        const savedApplication = await applicationData.save();
        return res.status(201).json({ savedApplication });

    }catch(error){
        return res.status(500).json({ message: "Error creating application" });
    }
}

//Read

export const fetch = async (req, res) => {
    try{
        const applications = await Application.find();  
        if(applications.length === 0){
            return res.status(404).json({ message: "No applications found" });
        }
        return res.status(200).json({ applications });
    }catch(err){
        return res.status(500).json({ message: "Error fetching data" });
    }
}

//Update

export const updateApplication = async (req, res) => {
    try{
        const id = req.params.id;
        const applicationExist = await Application.findOne({ _id: id });
        if(!applicationExist){
            return res.status(404).json({ message: "Application not found" });
        }

        const updatedApplication = await Application.findByIdAndUpdate(id, req.body, { new: true });
        return res.status(200).json({ updatedApplication });
    }catch(error){
        res.status(500).json({error : "Internal Server error."});
    }
}

//Delete

export const deleteApplication = async (req, res) => {
    try{
        const id = req.params.id;
        const applicationExist = await Application.findOne({ _id: id });
        if(!applicationExist){
            return res.status(404).json({ message: "Application not found" });
        }

        await Application.findByIdAndDelete(id);
        return res.status(200).json({ message: "Application deleted successfully" });
    }catch(error){
        res.status(500).json({error : "Internal Server error."});
    }
}