import { ChainIdParams } from './network';
import { PageLimit } from './page-limit';

export interface GetByChainIdAndPageLimitRequest extends ChainIdParams, PageLimit {}
