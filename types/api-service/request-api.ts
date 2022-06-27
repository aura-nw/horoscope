import { ChainIdParams } from './network';
import { PageLimit } from './page-limit';

export interface GetProposalByChainIdRequest extends ChainIdParams, PageLimit {}
