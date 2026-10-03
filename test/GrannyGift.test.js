const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("GrannyGift", function () {
  let grannyGift;
  let owner, grandchild1, grandchild2, stranger;
  let gc1Addr, gc2Addr;

  const DAY = 86400;
  let now;
  let birthday1;   // день рождения 1-го внука (в будущем)
  let birthday2;   // день рождения 2-го внука (в будущем)
  const deposit = ethers.parseEther("3");

  beforeEach(async function () {
    [owner, grandchild1, grandchild2, stranger] = await ethers.getSigners();
    gc1Addr = grandchild1.address;
    gc2Addr = grandchild2.address;

    // Текущее время сети Hardhat
    now = await time.latest();

    // Дни рождения задаём В БУДУЩЕМ относительно now
    birthday1 = now + DAY;         // через 1 день
    birthday2 = now + DAY * 2;     // через 2 дня

    const F = await ethers.getContractFactory("GrannyGift");
    grannyGift = await F.deploy(
      [gc1Addr, gc2Addr],
      [birthday1, birthday2],
      { value: deposit }
    );
    await grannyGift.waitForDeployment();
  });

  // 1. Деплой и настройка
  it("бабушка деплоит контракт, вносит ETH и задаёт внуков", async function () {
    expect(await ethers.provider.getBalance(grannyGift.target)).to.equal(deposit);
    expect(await grannyGift.birthdays(gc1Addr)).to.equal(birthday1);
    expect(await grannyGift.birthdays(gc2Addr)).to.equal(birthday2);
  });

  // 2. Деление суммы
  it("сумма правильно делится между внуками", async function () {
    expect(await grannyGift.giftAmount()).to.equal(deposit / 2n);
  });

  // 3. Успешное снятие В ДЕНЬ рождения
  it("успешное снятие в день рождения", async function () {
    await time.increaseTo(birthday1);   // ровно в день рождения
    await expect(grannyGift.connect(grandchild1).withdraw())
      .to.changeEtherBalance(grandchild1, deposit / 2n);
  });

  // 4. Успешное снятие ПОСЛЕ дня рождения
  it("успешное снятие после дня рождения", async function () {
    await time.increaseTo(birthday2 + DAY * 5);  // через 5 дней после ДР
    await expect(grannyGift.connect(grandchild2).withdraw())
      .to.changeEtherBalance(grandchild2, deposit / 2n);
  });

  // 5. Нельзя снять ДО дня рождения
  it("нельзя снять до дня рождения", async function () {
    // Время сейчас = now, день рождения = now + DAY,
    // значит попытка снять сейчас должна упасть.
    await expect(
      grannyGift.connect(grandchild1).withdraw()
    ).to.be.revertedWith("Too early");
  });

  // 6. Повторное снятие
  it("нельзя снять повторно", async function () {
    await time.increaseTo(birthday1);
    await grannyGift.connect(grandchild1).withdraw();
    await expect(
      grannyGift.connect(grandchild1).withdraw()
    ).to.be.revertedWith("Already withdrawn");
  });

  // 7. Посторонний
  it("сторонний не может снять", async function () {
    await time.increaseTo(birthday1);
    await expect(
      grannyGift.connect(stranger).withdraw()
    ).to.be.revertedWith("Not a grandchild");
  });

  // 8. Событие
  it("при снятии генерируется событие с адресом и суммой", async function () {
    await time.increaseTo(birthday1);
    await expect(grannyGift.connect(grandchild1).withdraw())
      .to.emit(grannyGift, "GiftWithdrawn")
      .withArgs(gc1Addr, deposit / 2n);
  });
});