import { CorridorLiquidity, BlockchainNetwork } from '../../types';
import { INITIAL_CORRIDORS } from './seedData';

export class TreasuryService {
  private corridors: Map<string, CorridorLiquidity> = new Map();

  constructor() {
    INITIAL_CORRIDORS.forEach(c => {
      this.corridors.set(c.corridorId, { ...c });
    });
  }

  public getCorridors(): CorridorLiquidity[] {
    return Array.from(this.corridors.values());
  }

  public getTotalLiquidityUsd(): number {
    return Array.from(this.corridors.values()).reduce((acc, c) => acc + c.currentLiquidityUsd, 0);
  }

  /**
   * Automated Corridor Rebalancing
   * Moves stablecoin liquidity from surplus corridors or global treasury to target corridor.
   */
  public rebalanceCorridor(corridorId: string, amountUsd: number, network: BlockchainNetwork = 'Solana'): {
    success: boolean;
    txHash: string;
    message: string;
    updatedCorridor?: CorridorLiquidity;
  } {
    const c = this.corridors.get(corridorId);
    if (!c) {
      return { success: false, txHash: '', message: 'Corridor not found' };
    }

    c.currentLiquidityUsd += amountUsd;
    if (c.currentLiquidityUsd >= c.targetLiquidityUsd) {
      c.status = 'healthy';
    } else if (c.currentLiquidityUsd >= c.minimumBufferUsd) {
      c.status = 'warning';
    }

    const txHash = network === 'Solana' 
      ? `5Uf7...${Math.random().toString(36).substring(2, 8)}`
      : `0x71a...${Math.random().toString(36).substring(2, 8)}`;

    return {
      success: true,
      txHash,
      message: `Rebalanced +$${amountUsd.toLocaleString()} USD into ${c.name} via ${network} USDC rail.`,
      updatedCorridor: { ...c }
    };
  }
}

export const treasuryService = new TreasuryService();
