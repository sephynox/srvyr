//@ts-ignore
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("BalanceChecker", {
    from: deployer,
    args: [],
  });
};
