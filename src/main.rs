struct GameComponent {
    component_type: String,
    id: String,
    state: SpaceState,
    children: Vec<GameComponent>
}

#[derive(PartialEq)]
enum SpaceState {
    EMPTY,
    DRAW,
    X,
    O
}

fn main() {
    println!("Hello, world!");

    construct_game_state([])
}

// fn square_component_play(component: GameComponent, moves: &[&str]) -> Result<GameComponent, String> {
//     if component.id != *moves.last().unwrap() {
//         return Err(String::from("Invalid Move"));
//     }
//     if component.state != SpaceState::EMPTY {
//         return Err(String::from("Invalid Move: Space is not empty"));
//     }
//     Ok(GameComponent {
//         id: component.id,
//         component_type: String::from("CORE-SPACE"),
//         state: if moves.len() % 2 == 1 { SpaceState::X } else { SpaceState::O },
//         children: component.children
//     })
// }

fn construct_game_state(components: &[&str], id: Option<&str>) {
    if components.len() === 0 {
        panic!()
    }
    let length = get_component_length(components[0]);
}

fn get_component_length(component: &str) -> u32 {
    match component {
        "CORE-SPACE" => 0,
        "CORE-BOARD" => 9,
        default => panic!(),
    }
}


