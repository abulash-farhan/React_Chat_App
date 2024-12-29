const Messages = require("../models/messageModel");

function convertToIST(utcTimestamp) {
  // Parse the UTC timestamp into a Date object
  const utcDate = new Date(utcTimestamp);
  
  // Add 5 hours and 30 minutes to get IST time
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const istDate = new Date(utcDate.getTime() + istOffset);
  
  // Extract hours and minutes
  let hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  
  // Determine AM or PM
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert to 12-hour format

  // Format minutes as two digits
  const formattedMinutes = minutes.toString().padStart(2, "0");
  
  // Return the formatted time
  return `${hours}:${formattedMinutes} ${ampm}`;
}


module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
        time: convertToIST(msg.updatedAt)
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};
