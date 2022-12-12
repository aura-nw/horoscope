/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Model } from 'objection';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const knex = require('../../config/database');

@Entity('proposals')
class Proposals extends Model {
	@PrimaryGeneratedColumn('increment')
	pro_id: number | undefined;

	@Column()
	pro_tx_hash: string | undefined;

	@Column()
	pro_proposer: string | undefined;

	@Column()
	pro_proposer_address: string | undefined;

	@Column()
	pro_type: string | undefined;

	@Column()
	pro_title: string | undefined;

	@Column()
	pro_description: string | undefined;

	@Column({ default: null })
	pro_status: string | undefined;

	@Column({ default: 0.0 })
	pro_votes_yes: number | undefined;

	@Column({ default: 0.0 })
	pro_votes_abstain: number | undefined;

	@Column({ default: 0.0 })
	pro_votes_no: number | undefined;

	@Column()
	pro_votes_no_with_veto: number | undefined;

	@Column()
	pro_submit_time: Date | undefined;

	@Column()
	pro_deposit_end_time: Date | undefined;

	@Column({ default: 0.0 })
	pro_total_deposits: number | undefined;

	@Column({ default: '2000-01-01 00:00:00' })
	pro_voting_start_time: Date | undefined;

	@Column({ default: '2000-01-01 00:00:00' })
	pro_voting_end_time: Date | undefined;

	@Column({ default: 0 })
	pro_voters: number | undefined;

	@Column({ default: 0.0 })
	pro_participation_rate: number | undefined;

	@Column({ default: 0.0 })
	pro_turnout: number | undefined;

	@Column({ type: 'json', nullable: true })
	pro_activity: any;

	@Column({ default: false })
	is_delete: boolean | undefined;

	@Column()
	request_amount: number | undefined;
}

Proposals.knex(knex);

module.exports = Proposals;
