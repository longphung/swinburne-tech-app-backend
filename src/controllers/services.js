const getAllServices = async (req, res) =>{
res.status(200).json({msg: "All services"});
};

module.exports = {getAllServices};