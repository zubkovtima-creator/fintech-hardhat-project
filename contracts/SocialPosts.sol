// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SocialPosts {
    struct Post {
        uint256 id;
        address author;
        string  content;
        string  imageUrl;     // опционально: URL картинки
        uint256 createdAt;
        uint256 likes;
    }

    Post[] public posts;

    // postId => (user => already liked?)
    mapping(uint256 => mapping(address => bool)) public hasLiked;

    event PostCreated(uint256 indexed id, address indexed author, string content, uint256 createdAt);
    event PostDeleted(uint256 indexed id, address indexed author);
    event PostLiked(uint256 indexed id, address indexed liker, uint256 totalLikes);
    event PostUnliked(uint256 indexed id, address indexed unliker, uint256 totalLikes);

    // 1. Создать пост
    function createPost(string memory _content, string memory _imageUrl) external {
        require(bytes(_content).length > 0, "Content required");

        posts.push(Post({
            id:        posts.length,
            author:    msg.sender,
            content:   _content,
            imageUrl:  _imageUrl,
            createdAt: block.timestamp,
            likes:     0
        }));

        emit PostCreated(posts.length - 1, msg.sender, _content, block.timestamp);
    }

    // 2. Удалить свой пост
    function deletePost(uint256 _id) external {
        require(_id < posts.length, "No such post");
        require(posts[_id].author == msg.sender, "Only author can delete");

        emit PostDeleted(_id, msg.sender);
        // Мягкое удаление: обнуляем содержимое, чтобы не сломать индексы
        delete posts[_id];
    }

    // 3. Удалить ВСЕ свои посты одним вызовом
    function deleteAllMyPosts() external {
        for (uint256 i = 0; i < posts.length; i++) {
            if (posts[i].author == msg.sender) {
                emit PostDeleted(i, msg.sender);
                delete posts[i];
            }
        }
    }

    // 4. Поставить лайк
    function likePost(uint256 _id) external {
        require(_id < posts.length, "No such post");
        require(posts[_id].author != address(0), "Post deleted");
        require(!hasLiked[_id][msg.sender], "Already liked");

        hasLiked[_id][msg.sender] = true;
        posts[_id].likes += 1;

        emit PostLiked(_id, msg.sender, posts[_id].likes);
    }

    // 5. Убрать лайк
    function unlikePost(uint256 _id) external {
        require(_id < posts.length, "No such post");
        require(hasLiked[_id][msg.sender], "Not liked yet");

        hasLiked[_id][msg.sender] = false;
        posts[_id].likes -= 1;

        emit PostUnliked(_id, msg.sender, posts[_id].likes);
    }

    // 6. Получить все посты (включая удалённые — с нулевым автором)
    function getAllPosts() external view returns (Post[] memory) {
        return posts;
    }

    // 7. Получить только посты конкретного автора
    function getPostsByAuthor(address _author) external view returns (Post[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < posts.length; i++) {
            if (posts[i].author == _author) count++;
        }

        Post[] memory result = new Post[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < posts.length; i++) {
            if (posts[i].author == _author) {
                result[j] = posts[i];
                j++;
            }
        }
        return result;
    }

    function getPostsCount() external view returns (uint256) {
        return posts.length;
    }
}