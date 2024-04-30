#[derive(Debug)]
pub struct GameComponent<'a> {
    component_type: &'a str,
    id: String,
    state: &'a SpaceState,
    children: Vec<GameComponent<'a>>
}

impl Clone for GameComponent<'_> {
    fn clone(&self) -> Self { 
        return GameComponent {
            component_type: self.component_type,
            id: self.id.clone(),
            state: self.state,
            children: self.children.to_vec()
        }
    }
}

#[derive(PartialEq, Debug, Clone, Copy)]
pub enum SpaceState {
    EMPTY,
    DRAW,
    X,
    O
}

pub fn describe_component(component: &GameComponent) -> String {
    let ids: Vec<&str> = component.id.split("-").collect();
    let mut ident = String::from("");
    for _ in 0..ids.len() - 1 {
        ident.push_str("  ");
    };
    let children: Vec<String> = component.children.iter().map(|x| describe_component(x)).collect();
    let mut children_joined = children.iter().fold(String::from(""), |curr, next| curr + next);
    if children_joined.len() > 0 {
        children_joined = String::from("\n") + &ident + &children_joined;
    }
    return format!(
        "{ident}{index}: {name} ({state:?}) [{children_joined}],\n",
        name = component.component_type,
        index = ids.last().unwrap(),
        state = component.state
    )
}

pub fn construct_game_state<'a>(components: &'a [&'a str], id: Option<String>) -> GameComponent<'a> {
    if components.len() == 0 {
        panic!()
    }
    let length = get_component_length(components[0]);

    let new_id = id.unwrap_or(String::from("1"));
    return GameComponent {
        id: new_id.clone(),
        component_type: components[0],
        state: &SpaceState::EMPTY,
        children: (1..=length).map(|i| construct_game_state(&components[1..], Some(format!("{new_id}-{i}")))).collect()
    }
}

pub fn playmove<'a>(moves: &[&str], previous_state: &'a GameComponent) -> Result<GameComponent<'a>, String> {
    let last_move = moves.last();
    if last_move.is_none() {
        return Ok(previous_state.clone());
    };
    let last_move = last_move.unwrap();

    let ids: Result<Vec<usize>, String> = last_move.split("-").map(|x| x.parse::<usize>().or(Err(String::from("Invalid Move")))).skip(1).collect();

    let mut current_component = previous_state;
    let mut component_stack = vec![previous_state];
    for id in ids? {
        if current_component.children.len() == 0 {
            return Err(String::from("Move too long"));
        }
        current_component = current_component.children.get(id-1).ok_or(String::from("Invalid Move"))?;
        component_stack.push(current_component);
    };

    let mut last_component: Option<GameComponent> = None;
    for component in component_stack.iter().rev() {
        last_component = Some(play(component, moves, last_component)?);
    }
    return Ok(last_component.unwrap_or(previous_state.clone()));
}

fn play<'a>(component: &'a GameComponent, moves: &[&str], child_state: Option<GameComponent<'a>>) -> Result<GameComponent<'a>, String> {
    match component.component_type {
        "CORE-SPACE" => square_component_play(component, moves),
        "CORE-BOARD" => board_component_play(component, moves, child_state),
        _ => panic!(),
    }
}

fn square_component_play<'a>(component: &'a GameComponent, moves: &[&str]) -> Result<GameComponent<'a>, String> {
    if component.id != *moves.last().unwrap() {
        return Err(String::from("Invalid Move"));
    }
    if component.state != &SpaceState::EMPTY {
        return Err(String::from("Invalid Move: Space is not empty"));
    }
    Ok(GameComponent {
        id: component.id.clone(),
        component_type: "CORE-SPACE",
        state: if moves.len() % 2 == 1 { &SpaceState::X } else { &SpaceState::O },
        children: vec![]
    })
}

const SOLVED_STATES: [[usize; 3]; 8] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],

  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],

  [0, 4, 8],
  [6, 4, 2],
];


fn board_component_play<'a>(component: &'a GameComponent, moves: &[&str], child_state: Option<GameComponent<'a>>) -> Result<GameComponent<'a>, String> {
    if child_state.is_none() {
        return Err(String::from("Missing child state"))
    }

    if component.state != &SpaceState::EMPTY {
        return Err(String::from("Board already has state"))
    }

    let index: u32 = match moves.last().unwrap()[component.id.len()..].split("-").filter(|x| *x != "").next().unwrap().parse() {
        Ok(it) => it,
        Err(_) => return Err(String::from("Invalid Move or ID")),
    };

    let mut new_spaces: Vec<GameComponent> = component.children.to_vec();
    let changed = new_spaces.get_mut(index as usize).unwrap();
    *changed = child_state.unwrap();

    let mut winner: &SpaceState = &SpaceState::EMPTY;

    for solution in SOLVED_STATES {
        let first_space = new_spaces.get(solution[0]).unwrap().state;
        if first_space == &SpaceState::EMPTY || first_space == &SpaceState::DRAW {
            continue;
        }
        if first_space == new_spaces.get(solution[1]).unwrap().state && first_space == new_spaces.get(solution[2]).unwrap().state {
            winner = first_space;
            break;
        }
    };

    if winner == &SpaceState::EMPTY {
        if new_spaces.iter().all(|val| val.state != &SpaceState::EMPTY) {
            winner = &SpaceState::DRAW;
        } 
    };
    
    return Ok(GameComponent {
        id: component.id.clone(),
        component_type: component.component_type,
        state: winner,
        children: new_spaces
    })
}

fn get_component_length(component: &str) -> u32 {
    match component {
        "CORE-SPACE" => 0,
        "CORE-BOARD" => 9,
        _ => panic!(),
    }
}


