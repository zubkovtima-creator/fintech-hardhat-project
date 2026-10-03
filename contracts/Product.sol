// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ProductRegistry {
    struct Product {
        string  name;
        string  description;
        uint256 price;
        address creator;
        uint256 createdAt;
        string  imageUrl;
    }

    Product[] public products;

    event ProductCreated(
        uint256 indexed id,
        string  name,
        uint256 price,
        address indexed creator,
        uint256 createdAt,
        string  imageUrl
    );

    function createProduct(
        string memory _name,
        string memory _description,
        uint256 _price,
        string memory _imageUrl
    ) external {
        require(bytes(_name).length > 0, "Name is required");
        require(bytes(_imageUrl).length > 0, "Image URL is required");

        products.push(Product({
            name:        _name,
            description: _description,
            price:       _price,
            creator:     msg.sender,
            createdAt:   block.timestamp,
            imageUrl:    _imageUrl
        }));

        uint256 id = products.length - 1;
        emit ProductCreated(id, _name, _price, msg.sender, block.timestamp, _imageUrl);
    }

    function getProductsCount() external view returns (uint256) {
        return products.length;
    }

    function getAllProducts() external view returns (Product[] memory) {
        return products;
    }

    function getProduct(uint256 _id) external view returns (Product memory) {
        require(_id < products.length, "Product does not exist");
        return products[_id];
    }
}