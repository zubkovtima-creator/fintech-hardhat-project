const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SocialPosts", function () {
  let c, alice, bob;

  beforeEach(async () => {
    [alice, bob] = await ethers.getSigners();
    const F = await ethers.getContractFactory("SocialPosts");
    c = await F.deploy();
    await c.waitForDeployment();
  });

  it("создаёт пост", async () => {
    await c.connect(alice).createPost("hello", "");
    const all = await c.getAllPosts();
    expect(all.length).to.equal(1);
    expect(all[0].content).to.equal("hello");
  });

  it("фильтрует посты по автору", async () => {
    await c.connect(alice).createPost("a1", "");
    await c.connect(bob).createPost("b1", "");
    await c.connect(alice).createPost("a2", "");
    expect((await c.getPostsByAuthor(alice.address)).length).to.equal(2);
    expect((await c.getPostsByAuthor(bob.address)).length).to.equal(1);
  });

  it("лайк и снятие лайка", async () => {
    await c.connect(alice).createPost("p", "");
    await c.connect(bob).likePost(0);
    expect((await c.getAllPosts())[0].likes).to.equal(1);
    await c.connect(bob).unlikePost(0);
    expect((await c.getAllPosts())[0].likes).to.equal(0);
  });

  it("нельзя лайкнуть дважды", async () => {
    await c.connect(alice).createPost("p", "");
    await c.connect(bob).likePost(0);
    await expect(c.connect(bob).likePost(0)).to.be.revertedWith("Already liked");
  });

  it("удалить может только автор", async () => {
    await c.connect(alice).createPost("p", "");
    await expect(c.connect(bob).deletePost(0)).to.be.revertedWith("Only author can delete");
  });

  it("автор удаляет свой пост", async () => {
    await c.connect(alice).createPost("p", "");
    await c.connect(alice).deletePost(0);
    expect((await c.getAllPosts())[0].author).to.equal(ethers.ZeroAddress);
  });

  it("deleteAllMyPosts удаляет все посты автора", async () => {
    await c.connect(alice).createPost("a1", "");
    await c.connect(bob).createPost("b1", "");
    await c.connect(alice).createPost("a2", "");
    await c.connect(alice).deleteAllMyPosts();
    const all = await c.getAllPosts();
    expect(all[0].author).to.equal(ethers.ZeroAddress);
    expect(all[1].author).to.equal(bob.address);
    expect(all[2].author).to.equal(ethers.ZeroAddress);
  });
});