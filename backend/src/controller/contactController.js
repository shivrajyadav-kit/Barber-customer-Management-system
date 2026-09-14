import contactModel from "../models/contactModel.js";


const createContact = async(req, res) => {
    try {
        const {name, email, phone, message} = req.body;
        if(!name || !name.trim()){
            return res.status(400).json({message:"Name is required"})
        }
        if(!email || !email.trim()){
            return res.status(400).json({message:"Email is required"})
        }
        if(!message || !message.trim()){
            return res.status(400).json({message:"Message is required"})
        }
        const contact = await contactModel.create({
            name:name.trim(),
            email:email.trim(),
            phone:phone?.trim() || "",
            message:message.trim()
        })
        return res.status(201).json({message: "Message sent succesfully"})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Server error"})
    }
}

export default createContact;