import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform  } from "react-native";
import { connect } from "react-redux";

class InitialComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nom: null,
            prenom: null,
        };
    }

    parametre() {
        this.props.nav.navigate("Parametre");
    }

    render() {
        const nom = this.props.nom.substr(0, 1);
        const prenom = this.props.prenom.substr(0, 1);
        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.circle} onPress={() => this.parametre()}>
                    <Text style={styles.initialText}>{prenom + nom}</Text>
                </TouchableOpacity>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        margin: 10,
        marginBottom: 15,
    },
    circle: {
        width: Platform.OS === 'ios' ? 40 : 50,
        height: Platform.OS === 'ios' ? 40 : 50,
        borderRadius: 150 / 2,
        backgroundColor: "#376092",
        justifyContent: "center",
        alignItems: "center",
    },
    initialText: {
        color: "#fff",
    },
});
const mapStateToProps = (state) => {
    return {
        email: state.emailReducer.email,
        password: state.passwordReducer.password,
        nom: state.nomReducer.nom,
        prenom: state.prenomReducer.prenom,
    };
};
export default connect(mapStateToProps)(InitialComponent);
