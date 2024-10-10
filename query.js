const orderSchema = require('./models/v1/Schema/order_schema');
const orderItemSchema = require('./models/v1/Schema/orderitem_schema');
const productSchema = require('./models/v1/Schema/product_schema');

// Find User wise - product-wise ordering quantity with total item value
let Userwiseandproductwiseorder = await orderSchema.aggregate([
    {
        $lookup: {
            from: "tbl_order_items",
            localField: "_id",
            foreignField: "order_id",
            as: "order_items"
        }
    },
    {
        $lookup: {
            from: "tbl_users",
            localField: "user_id",
            foreignField: "_id",
            as: "user"
        }
    },
    {
        $unwind: "$user"
    },
    {
        $unwind: "$order_items"
    },
    {
        $lookup: {
            from: "tbl_products",
            localField: "order_items.product_id",
            foreignField: "_id",
            as: "product"
        }
    },
    {
        $unwind: "$product"
    },
    {
        $project: {
            "user_id": 1,
            "user_name": "$user.full_name",
            "product_name": "$product.product_name",
            "quantity": "$order_items.quantity",
            "unit_price": "$order_items.unit_price",
            "total_price": "$order_items.total_price",
            "order_date": 1
        }
    }
]);

//Weekly Orders analysis for the first quarter of 2024
let WeeklyOrders = await orderSchema.aggregate([
    {
        $match: {
            order_date: {
                $gte: new Date("2024-01-01T00:00:00Z"),
                $lte: new Date("2024-03-31T23:59:59Z")
            }
        }
    },
    {
        $lookup: {
            from: "tbl_order_items",
            localField: "_id",
            foreignField: "order_id",
            as: "order_items"
        }
    },
    {
        $group: {
            _id: {
                year: { $year: "$order_date" },
                week: { $isoWeek: "$order_date" }
            },
            totalOrders: { $sum: 1 }, 
            totalValue: { $sum: "$amount" },
            order_items: { $push: "$order_items" }
        }
    },
    {
        $unwind: "$order_items"
    },
    {
        $unwind: "$order_items"
    },
    {
        $group: {
            _id: {
                year: "$_id.year",
                week: "$_id.week"
            },
            totalOrders: { $first: "$totalOrders" },
            totalValue: { $first: "$totalValue" },
            totalQuantity: { $sum: "$order_items.quantity" }
        }
    },
    {
        $sort: {
            "_id.year": 1,
            "_id.week": 1
        }
    },
    {
        $project: {
            _id: 0,
            year: "$_id.year",
            week: "$_id.week",
            totalOrders: 1,
            totalQuantity: 1,
            totalValue: 1
        }
    }
]); 

// Retrieve the Product name and No. of Orders from Sales. Exclude products with fewer than 5 Orders.
let ProductnameandNoofOrders = await orderItemSchema.aggregate([
    {
        $lookup: {
            from: "tbl_products",
            localField: "product_id",
            foreignField: "_id",
            as: "product"
        }
    },
    {
        $group: {
            _id: "$product.product_name",
            total_orders: { $sum: 1 }
        }
    },
    {
        $match: {
            total_orders: { $gte: 5 }
        }
    },
    {
        $project: {
            _id: 0, 
            product_name: "$_id",
            total_orders: 1   
        }
    }
]);

// Find the products that are sold more than 7 times or have not sold yet in the first quarter of 2024
let productData = await productSchema.aggregate([
    {
        $lookup: {
            from: "tbl_order_items",
            localField: "_id",
            foreignField: "product_id",
            as: "order_items"
        }
    },
    {
        $unwind: { path: "$order_items", preserveNullAndEmptyArrays: true }
    },
    {
        $lookup: {
            from: "tbl_orders",
            localField: "order_items.order_id",
            foreignField: "_id",
            as: "order"
        }
    },
    {
        $unwind: { path: "$order", preserveNullAndEmptyArrays: true }
    },
    {
        $match: {
            $or: [
                { "order.order_date": { $gte: new Date("2024-01-01T00:00:00Z"), $lte: new Date("2024-03-31T23:59:59Z") } },
                { "order.order_date": null }
            ]
        }
    },
    {
        $group: {
            _id: "$_id",
            product_name: { $first: "$product_name" },
            total_sold: {
                $sum: {
                    $cond: [
                        { $eq: ["$order.order_status", "CONFIRM"] },
                        "$order_items.quantity",
                        0
                    ]
                }
            }
        }
    },
    {
        $match: {
            $or: [
                { total_sold: { $gt: 7 } },
                { total_sold: 0 }
            ]
        }
    },
    {
        $project: {
            _id: 0,
            product_name: 1,
            total_sold: 1
        }
    }
]);
