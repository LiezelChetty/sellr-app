begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

select has_function('public', 'transition_offer', array['uuid','text','numeric'], 'offer transition RPC exists');
select has_function('public', 'start_listing_conversation', array['uuid'], 'conversation RPC exists');
select policies_are('public', 'offers', array['offer parties can read','buyer creates valid offers'], 'offers expose only intended policies');
select policies_are('public', 'messages', array['members read messages','members send own messages'], 'messages require membership');
select policies_are('public', 'conversation_members', array['members see conversation participants'], 'conversation participants are private');
select has_function('public', 'claim_ai_analysis_request', array['integer'], 'AI quota claim RPC exists');

select * from finish();
rollback;
