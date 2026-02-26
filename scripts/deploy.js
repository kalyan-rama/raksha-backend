async function main() {
  const Raksha = await ethers.getContractFactory("Raksha");
  const raksha = await Raksha.deploy();

  await raksha.waitForDeployment();

  console.log("Raksha deployed to:", await raksha.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});