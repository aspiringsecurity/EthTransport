import { LENS_NETWORK } from '../constants';
import { MainnetContracts, SandboxContracts, TestnetContracts } from '../contracts';
import LensEndpoint from '../lens-endpoints';

const getEnvConfig = (): {
  apiEndpoint: string;
  lensHubProxyAddress: `0x${string}`;
  lensPeripheryAddress: `0x${string}`;
  defaultCollectToken: string;
  UpdateOwnableFeeCollectModuleAddress: `0x${string}`;
  litProtocolEnvironment: string;
  isRelayerAvailable: boolean;
  isRaribleAvailable: boolean;
  isLitAvailable: boolean;
} => {
  switch (LENS_NETWORK) {
    case 'mainnet':
      return {
        apiEndpoint: LensEndpoint.Mainnet,
        lensHubProxyAddress: MainnetContracts.LensHubProxy,
        lensPeripheryAddress: MainnetContracts.LensPeriphery,
        defaultCollectToken: MainnetContracts.DefaultToken,
        UpdateOwnableFeeCollectModuleAddress: MainnetContracts.UpdateOwnableFeeCollectModule,
        litProtocolEnvironment: 'polygon',
        isRelayerAvailable: false,
        isRaribleAvailable: false,
        isLitAvailable: false
      };
    case 'testnet':
      return {
        apiEndpoint: LensEndpoint.Testnet,
        lensHubProxyAddress: TestnetContracts.LensHubProxy,
        lensPeripheryAddress: TestnetContracts.LensPeriphery,
        defaultCollectToken: TestnetContracts.DefaultToken,
        UpdateOwnableFeeCollectModuleAddress: TestnetContracts.UpdateOwnableFeeCollectModule,
        litProtocolEnvironment: 'mumbai',
        isRelayerAvailable: false,
        isRaribleAvailable: false,
        isLitAvailable: false
      };
    case 'staging':
      return {
        apiEndpoint: LensEndpoint.Staging,
        lensHubProxyAddress: TestnetContracts.LensHubProxy,
        lensPeripheryAddress: TestnetContracts.LensPeriphery,
        defaultCollectToken: TestnetContracts.DefaultToken,
        UpdateOwnableFeeCollectModuleAddress: TestnetContracts.UpdateOwnableFeeCollectModule,
        litProtocolEnvironment: 'mumbai',
        isRelayerAvailable: false,
        isRaribleAvailable: false,
        isLitAvailable: false
      };
    case 'sandbox':
      return {
        apiEndpoint: LensEndpoint.Sandbox,
        lensHubProxyAddress: SandboxContracts.LensHubProxy,
        lensPeripheryAddress: SandboxContracts.LensPeriphery,
        defaultCollectToken: TestnetContracts.DefaultToken,
        UpdateOwnableFeeCollectModuleAddress: TestnetContracts.UpdateOwnableFeeCollectModule,
        litProtocolEnvironment: 'mumbai-sandbox',
        isRelayerAvailable: false,
        isRaribleAvailable: false,
        isLitAvailable: false
      };
    case 'staging-sandbox':
      return {
        apiEndpoint: LensEndpoint.StagingSandbox,
        lensHubProxyAddress: SandboxContracts.LensHubProxy,
        lensPeripheryAddress: SandboxContracts.LensPeriphery,
        defaultCollectToken: TestnetContracts.DefaultToken,
        UpdateOwnableFeeCollectModuleAddress: TestnetContracts.UpdateOwnableFeeCollectModule,
        litProtocolEnvironment: 'mumbai-sandbox',
        isRelayerAvailable: false,
        isRaribleAvailable: false,
        isLitAvailable: false
      };
    default:
      return {
        apiEndpoint: LensEndpoint.Mainnet,
        lensHubProxyAddress: MainnetContracts.LensHubProxy,
        lensPeripheryAddress: MainnetContracts.LensPeriphery,
        defaultCollectToken: MainnetContracts.DefaultToken,
        UpdateOwnableFeeCollectModuleAddress: MainnetContracts.UpdateOwnableFeeCollectModule,
        litProtocolEnvironment: 'polygon',
        isRelayerAvailable: false,
        isRaribleAvailable: false,
        isLitAvailable: false
      };
  }
};

export default getEnvConfig;
