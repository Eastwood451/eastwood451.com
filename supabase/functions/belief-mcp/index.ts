import {createDatabase,createHandler,SITE} from './server.js';
import * as beliefModel from './belief-model.js';
// Custom OAuth / owner-capability checks authenticate every data operation.
const db=createDatabase(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
Deno.serve(createHandler(db,{
  model:beliefModel,base:SITE+'/api/smfi/belief',readScope:'belief:read',writeScope:'belief:write',
  title:'SMFI Belief Map',setup:'/SMFI_Suite/chatgpt.html?kind=belief',
  isState:state=>state?.kind==='belief-map',
  instructions:'Use belief_list_maps to discover maps and belief_read_map before editing. Stable node and edge IDs must be preserved. Use belief_select_map to display a map in the browser. Distinguish observations, feelings, assumptions and hypotheses. Weights/confidence are model values. Batch dependent graph changes in belief_edit_map with the current library revision. The bridge makes no model API calls.'
}));
