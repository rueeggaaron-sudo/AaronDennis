import axios from 'axios';

const BASE_URL = 'https://mempool.space/api';

export interface BlockData {
  height: number;
  timestamp: number;
}

export const getLatestBlock = async (): Promise<BlockData> => {
  const heightResponse = await axios.get(`${BASE_URL}/blocks/tip/height`);
  const height = heightResponse.data;

  const blockHashResponse = await axios.get(`${BASE_URL}/block-height/${height}`);
  const blockHash = blockHashResponse.data;

  const blockResponse = await axios.get(`${BASE_URL}/block/${blockHash}`);
  const { timestamp } = blockResponse.data;

  return {
    height,
    timestamp,
  };
};
