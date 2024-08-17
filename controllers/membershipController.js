const Membership = require('../models/membership');

const getMembers = async (req, res) => {
    try {
        const results = await Membership.find();
        res.status(200).json(results);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// @desc Update an member status
// @Route PUT /membership
// @Private access
const updateMember = async (req, res) => {
    const { id, status, reason } = req.body;
    try {
        const member = await Membership.findById(id);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
  
        const updatedStatus = await Membership.findByIdAndUpdate(id, { status:status, reasonToReject:reason}, { new: true });
        if (updatedStatus) {
            res.status(200).json({ message: "Member status updated successfully" });
        } else {
            res.status(400).json({ message: "Error updating Member record!" });
        }
  
    } catch (error) {
        console.error("Error updating Member:", error);
        res.status(500).json({ message: "Internal server error" });
    }
  };

// @desc DELETE an Member status
// @Route DELETE /membership
// @Private access
const deleteMember = async (req, res) => {
    const { id} = req.body;
    console.log(req.body);
    try {
        const member = await Membership.deleteOne({_id:id});
        if (member) {
            res.status(200).json({ message: "Member deleted successfully" });
        } else {
            res.status(400).json({ message: "Error deleting Member record!" });
        }
  
    } catch (error) {
        console.error("Error updating Member:", error);
        res.status(500).json({ message: "Internal server error" });
    }
  };

module.exports = {
    getMembers,
    updateMember,
    deleteMember
  }