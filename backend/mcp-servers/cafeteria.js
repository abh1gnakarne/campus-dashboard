// MCP Server: Cafeteria
// Handles today's menu, meal timings, special items

const CAFETERIA_MENU = {
  Monday: {
    breakfast: {
      time: "7:30 AM - 9:30 AM",
      items: ["Idli Sambar", "Bread Omelette", "Poha", "Tea / Coffee", "Boiled Eggs"],
    },
    lunch: {
      time: "12:00 PM - 2:30 PM",
      items: ["Rice", "Dal Tadka", "Rajma", "Roti", "Salad", "Curd", "Papad"],
      special: "Rajma Monday 🫘",
    },
    snacks: {
      time: "4:30 PM - 6:00 PM",
      items: ["Samosa", "Chai", "Biscuits", "Bread Pakoda"],
    },
    dinner: {
      time: "7:30 PM - 9:30 PM",
      items: ["Roti", "Paneer Butter Masala", "Dal Makhani", "Rice", "Kheer"],
    },
  },
  Tuesday: {
    breakfast: {
      time: "7:30 AM - 9:30 AM",
      items: ["Upma", "Vada Sambar", "Cornflakes", "Tea / Coffee"],
    },
    lunch: {
      time: "12:00 PM - 2:30 PM",
      items: ["Rice", "Sambar", "Aloo Gobi", "Roti", "Pickle", "Buttermilk"],
      special: null,
    },
    snacks: {
      time: "4:30 PM - 6:00 PM",
      items: ["Maggi", "Chai", "Fruit"],
    },
    dinner: {
      time: "7:30 PM - 9:30 PM",
      items: ["Roti", "Chana Masala", "Mix Veg", "Rice", "Sweet"],
    },
  },
  Wednesday: {
    breakfast: {
      time: "7:30 AM - 9:30 AM",
      items: ["Dosa", "Pongal", "Egg Bhurji", "Tea / Coffee"],
    },
    lunch: {
      time: "12:00 PM - 2:30 PM",
      items: ["Chole Rice", "Roti", "Boondi Raita", "Salad", "Papad"],
      special: "Chole Wednesday 🍛",
    },
    snacks: {
      time: "4:30 PM - 6:00 PM",
      items: ["Pav Bhaji", "Chai", "Juice"],
    },
    dinner: {
      time: "7:30 PM - 9:30 PM",
      items: ["Roti", "Dal Fry", "Bhindi Masala", "Rice", "Ice Cream"],
    },
  },
  Thursday: {
    breakfast: {
      time: "7:30 AM - 9:30 AM",
      items: ["Paratha", "Curd", "Pickle", "Tea / Coffee"],
    },
    lunch: {
      time: "12:00 PM - 2:30 PM",
      items: ["Rice", "Kadhi", "Aloo Sabzi", "Roti", "Salad"],
      special: null,
    },
    snacks: {
      time: "4:30 PM - 6:00 PM",
      items: ["Bhel Puri", "Chai", "Biscuits"],
    },
    dinner: {
      time: "7:30 PM - 9:30 PM",
      items: ["Roti", "Palak Paneer", "Dal", "Rice", "Halwa"],
    },
  },
  Friday: {
    breakfast: {
      time: "7:30 AM - 9:30 AM",
      items: ["Idli", "Medu Vada", "Coconut Chutney", "Tea / Coffee"],
    },
    lunch: {
      time: "12:00 PM - 2:30 PM",
      items: ["Biryani", "Raita", "Salan", "Salad", "Papad"],
      special: "Friday Biryani 🍚✨",
    },
    snacks: {
      time: "4:30 PM - 6:00 PM",
      items: ["Samosa Chat", "Chai", "Cold Drink"],
    },
    dinner: {
      time: "7:30 PM - 9:30 PM",
      items: ["Roti", "Shahi Paneer", "Dal Makhani", "Rice", "Gulab Jamun"],
    },
  },
  Saturday: {
    breakfast: {
      time: "8:00 AM - 10:00 AM",
      items: ["Aloo Paratha", "Curd", "Omelette", "Tea / Coffee"],
    },
    lunch: {
      time: "12:30 PM - 2:30 PM",
      items: ["Pulao", "Dal", "Sabzi", "Roti", "Salad"],
      special: null,
    },
    snacks: {
      time: "4:30 PM - 6:00 PM",
      items: ["Bread Butter", "Chai"],
    },
    dinner: {
      time: "7:30 PM - 9:00 PM",
      items: ["Roti", "Mix Dal", "Aloo Gobi", "Rice"],
    },
  },
  Sunday: {
    breakfast: {
      time: "8:30 AM - 10:30 AM",
      items: ["Chole Bhature", "Lassi", "Tea / Coffee"],
      special: "Special Sunday Breakfast! 🥳",
    },
    lunch: {
      time: "1:00 PM - 3:00 PM",
      items: ["Paneer Biryani", "Dal Makhani", "Salad", "Raita", "Gulab Jamun"],
      special: "Sunday Special Lunch 🎉",
    },
    snacks: {
      time: "5:00 PM - 6:00 PM",
      items: ["Maggi", "Chai"],
    },
    dinner: {
      time: "7:30 PM - 9:00 PM",
      items: ["Roti", "Dal Fry", "Aloo Matar", "Rice", "Sweet"],
    },
  },
};

export const cafeteriaMCP = {
  name: "cafeteria",
  description: "Campus cafeteria menu, timings, and meal info",

  tools: [
    {
      name: "get_todays_menu",
      description: "Get today's full cafeteria menu",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "get_meal",
      description: "Get a specific meal (breakfast/lunch/dinner/snacks)",
      inputSchema: {
        type: "object",
        properties: {
          meal: { type: "string", enum: ["breakfast", "lunch", "dinner", "snacks"] },
          day: { type: "string", description: "Day of week, defaults to today" },
        },
        required: ["meal"],
      },
    },
    {
      name: "get_weekly_menu",
      description: "Get the menu for a specific day or the whole week",
      inputSchema: {
        type: "object",
        properties: {
          day: { type: "string" },
        },
      },
    },
    {
      name: "get_timings",
      description: "Get all meal timings for today",
      inputSchema: { type: "object", properties: {} },
    },
  ],

  async executeTool(toolName, args) {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const targetDay = args?.day || today;
    const menu = CAFETERIA_MENU[targetDay] || CAFETERIA_MENU[today];

    switch (toolName) {
      case "get_todays_menu":
        return {
          day: today,
          menu: CAFETERIA_MENU[today],
          hasSpecial: Object.values(CAFETERIA_MENU[today] || {}).some((m) => m.special),
        };

      case "get_meal": {
        const mealData = menu?.[args.meal];
        if (!mealData) return { error: `No ${args.meal} data for ${targetDay}` };
        return { day: targetDay, meal: args.meal, ...mealData };
      }

      case "get_weekly_menu":
        if (args?.day) {
          return { day: args.day, menu: CAFETERIA_MENU[args.day] || null };
        }
        return { weeklyMenu: CAFETERIA_MENU };

      case "get_timings": {
        const timings = {};
        const todayMenu = CAFETERIA_MENU[today];
        if (todayMenu) {
          Object.entries(todayMenu).forEach(([meal, data]) => {
            timings[meal] = data.time;
          });
        }
        return { day: today, timings };
      }

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  },
};
