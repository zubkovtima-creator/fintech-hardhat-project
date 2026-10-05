// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MediaGallery {
    struct Media {
        uint256 id;
        address owner;
        string  title;
        string  imageUrl;
        uint256 createdAt;
        bool    isDeleted;   // ← флаг удаления (soft delete)
    }

    Media[] public mediaList;

    event MediaAdded(uint256 indexed id, address indexed owner, string title, string imageUrl);
    event MediaDeleted(uint256 indexed id, address indexed owner);

    // 1. Добавить картинку
    function addMedia(string memory _title, string memory _imageUrl) external {
        require(bytes(_imageUrl).length > 0, "Image URL required");

        mediaList.push(Media({
            id:        mediaList.length,
            owner:     msg.sender,
            title:     _title,
            imageUrl:  _imageUrl,
            createdAt: block.timestamp,
            isDeleted: false
        }));

        emit MediaAdded(mediaList.length - 1, msg.sender, _title, _imageUrl);
    }

    // 2. Пометить картинку как удалённую — только владелец
    function deleteMedia(uint256 _id) external {
        require(_id < mediaList.length, "No such media");
        require(mediaList[_id].owner == msg.sender, "Only owner can delete");
        require(!mediaList[_id].isDeleted, "Already deleted");

        mediaList[_id].isDeleted = true;

        emit MediaDeleted(_id, msg.sender);
    }

    // 3. Получить все НЕудалённые объекты (то, что покажет фронтенд)
    function getActiveMedia() external view returns (Media[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < mediaList.length; i++) {
            if (!mediaList[i].isDeleted) count++;
        }

        Media[] memory result = new Media[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < mediaList.length; i++) {
            if (!mediaList[i].isDeleted) {
                result[j] = mediaList[i];
                j++;
            }
        }
        return result;
    }

    // 4. Получить все, включая удалённые (для отладки / тестов)
    function getAllMedia() external view returns (Media[] memory) {
        return mediaList;
    }

    function getMediaCount() external view returns (uint256) {
        return mediaList.length;
    }
}