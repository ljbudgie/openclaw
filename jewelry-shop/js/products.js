// Product catalog data
const products = [
    {
        id: 1,
        name: "Classic Pearl Necklace",
        category: "necklaces",
        price: 89.99,
        description: "Elegant freshwater pearl necklace with sterling silver clasp",
        emoji: "📿"
    },
    {
        id: 2,
        name: "Diamond Stud Earrings",
        category: "earrings",
        price: 149.99,
        description: "Brilliant cut diamond earrings in 14k white gold",
        emoji: "💎"
    },
    {
        id: 3,
        name: "Gold Chain Bracelet",
        category: "bracelets",
        price: 119.99,
        description: "18k gold plated chain bracelet with secure clasp",
        emoji: "⛓️"
    },
    {
        id: 4,
        name: "Rose Gold Pendant",
        category: "necklaces",
        price: 79.99,
        description: "Delicate rose gold pendant with cubic zirconia accent",
        emoji: "🌹"
    },
    {
        id: 5,
        name: "Hoop Earrings",
        category: "earrings",
        price: 59.99,
        description: "Classic sterling silver hoop earrings, versatile style",
        emoji: "⭕"
    },
    {
        id: 6,
        name: "Charm Bracelet",
        category: "bracelets",
        price: 94.99,
        description: "Silver charm bracelet with decorative charms",
        emoji: "🎁"
    },
    {
        id: 7,
        name: "Layered Chain Necklace",
        category: "necklaces",
        price: 69.99,
        description: "Trendy multi-layer gold chain necklace",
        emoji: "✨"
    },
    {
        id: 8,
        name: "Crystal Drop Earrings",
        category: "earrings",
        price: 64.99,
        description: "Sparkling crystal drop earrings for special occasions",
        emoji: "💫"
    },
    {
        id: 9,
        name: "Tennis Bracelet",
        category: "bracelets",
        price: 199.99,
        description: "Classic tennis bracelet with simulated diamonds",
        emoji: "🎾"
    },
    {
        id: 10,
        name: "Heart Pendant Necklace",
        category: "necklaces",
        price: 54.99,
        description: "Romantic heart-shaped pendant in sterling silver",
        emoji: "❤️"
    },
    {
        id: 11,
        name: "Pearl Stud Earrings",
        category: "earrings",
        price: 44.99,
        description: "Timeless freshwater pearl stud earrings",
        emoji: "🦪"
    },
    {
        id: 12,
        name: "Bangle Bracelet Set",
        category: "bracelets",
        price: 74.99,
        description: "Set of 3 stackable gold-tone bangles",
        emoji: "🔶"
    }
];

// Get product by ID
function getProductById(id) {
    return products.find(product => product.id === parseInt(id));
}

// Get products by category
function getProductsByCategory(category) {
    if (category === 'all') {
        return products;
    }
    return products.filter(product => product.category === category);
}
