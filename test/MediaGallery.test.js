const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MediaGallery", function () {
  let c, alice, bob;

  beforeEach(async () => {
    [alice, bob] = await ethers.getSigners();
    const F = await ethers.getContractFactory("MediaGallery");
    c = await F.deploy();
    await c.waitForDeployment();
  });

  it("добавляет объект Media с корректными полями", async () => {
    await c.connect(alice).addMedia("Sunset", "https://picsum.photos/200");
    const all = await c.getAllMedia();
    expect(all.length).to.equal(1);
    expect(all[0].title).to.equal("Sunset");
    expect(all[0].imageUrl).to.equal("https://picsum.photos/200");
    expect(all[0].owner).to.equal(alice.address);
    expect(all[0].isDeleted).to.equal(false);
  });

  it("требует URL картинки", async () => {
    await expect(c.connect(alice).addMedia("No image", ""))
      .to.be.revertedWith("Image URL required");
  });

  it("удаляет объект через флаг isDeleted", async () => {
    await c.connect(alice).addMedia("Photo", "https://example.com/1.jpg");
    await c.connect(alice).deleteMedia(0);

    const all = await c.getAllMedia();
    expect(all[0].isDeleted).to.equal(true);
  });

  it("getActiveMedia возвращает только неудалённые", async () => {
    await c.connect(alice).addMedia("A", "https://a");
    await c.connect(alice).addMedia("B", "https://b");
    await c.connect(alice).addMedia("C", "https://c");

    await c.connect(alice).deleteMedia(1);   // удаляем B

    const active = await c.getActiveMedia();
    expect(active.length).to.equal(2);
    expect(active[0].title).to.equal("A");
    expect(active[1].title).to.equal("C");
  });

  it("удалять может только владелец", async () => {
    await c.connect(alice).addMedia("A", "https://a");
    await expect(c.connect(bob).deleteMedia(0))
      .to.be.revertedWith("Only owner can delete");
  });

  it("нельзя удалить дважды", async () => {
    await c.connect(alice).addMedia("A", "https://a");
    await c.connect(alice).deleteMedia(0);
    await expect(c.connect(alice).deleteMedia(0))
      .to.be.revertedWith("Already deleted");
  });

  it("генерирует события MediaAdded и MediaDeleted", async () => {
    await expect(c.connect(alice).addMedia("A", "https://a"))
      .to.emit(c, "MediaAdded")
      .withArgs(0, alice.address, "A", "https://a");

    await expect(c.connect(alice).deleteMedia(0))
      .to.emit(c, "MediaDeleted")
      .withArgs(0, alice.address);
  });
});