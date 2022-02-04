//@ts-ignore
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("TestToken", {
    from: deployer,
    args: ["TestToken", "TST", "1000000000000000000000000"],
  });
};
