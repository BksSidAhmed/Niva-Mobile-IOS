import React from "react";
import { StyleSheet, View, Text, StatusBar, TouchableOpacity, ActivityIndicator, Image, FlatList, Vibration, RefreshControl, SafeAreaView } from "react-native";
import moment from "moment";
import "moment/locale/fr";
import * as Animatable from "react-native-animatable";
import { connect } from "react-redux";
import { getToken, postAction, getUser } from "../api/index";
import Geolocation from "react-native-geolocation-service";
import { listeEmailAction } from "../redux/actions/listeEmailAction";
import { pointingAction } from "../redux/actions/pointingHorsLigneAction";
import { nomAction } from "../redux/actions/nomAction";
import { prenomAction } from "../redux/actions/prenomAction";
import { emailAction } from "../redux/actions/emailAction";
import { passwordAction } from "../redux/actions/passwordAction";
import { langueAction } from "../redux/actions/langueAction";
import { Button, Overlay } from "react-native-elements";
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import { PermissionsAndroid } from "react-native";
import { request, check, PERMISSIONS, RESULTS } from "react-native-permissions";
import { getDistance } from "geolib";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { Collapse, CollapseHeader, CollapseBody } from "accordion-collapse-react-native";
import NetInfo from "@react-native-community/netinfo";
import { traduction } from "../locale/local";

class ManagementTime extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            time: "",
            time_fixed: "",
            loader_response: false,
            loader_list_buttons: true,
            render_loader: false,
            render_activites: false,
            render_response: false,
            render_confirmation: false,
            latitude: "",
            longitude: "",
            visible_modal_no_internet_connection: false,
            visible_modal_error_unknown: false,
            visible_modal_mouvements_en_attente: false,
            user: "",
            current_ico: "",
            current_libelle: "",
            current_text: "",
            statut_0: null,
            statut_1: null,
            statut_2: null,
            statut_3: null,
            statut_4: null,
            statut_5: null,
            error_serveur: false,
            activite: null,
            activites: null,
            refreshing: false,
            mouvements_en_attente: false,
            mouvements: null,
            disable_bouton_mouvements: true,
            text_error_network: "",
            text_mouvement: "",
            expanded_0: false,
            expanded_1: false,
            expanded_2: false,
            expanded_3: false,
            expanded_4: false,
            expanded_5: false,
            etat_network: true,
            test_geolocalisation: false,
            code_lieu: null,
        };
        this.flatListRef = null;
    }

    UNSAFE_componentWillMount() {
        NetInfo.fetch().then((netInfos) => {
            this.setState({
                etat_network: netInfos.isConnected,
            });
            if (!netInfos.isConnected) {
                this._toggleOverlay("no-internet-connection");
                this.setState({
                    refreshing: false,
                    loader_list_buttons: false,
                });
            } else {
                this._sendMouvements("normal");
                this._getUserData();
                this._getMouvementsEnAttente();
            }
        });
        this._startClock();

        this.props.navigation.setOptions({ title: "Niva - " + traduction("TITLE_MANAGEMENT_TIME", this.props.langue) });
    }

    componentWillUnmount = () => {
        clearInterval(this.IntervalClock);
        //LocationServicesDialogBox.stopListener();
    };

    _getMouvementsEnAttente = () => {
        var dataPointing = this.props.pointing;
        if (dataPointing.length === 0) {
            this.setState({
                mouvements_en_attente: false,
            });
        } else {
            this.setState({
                mouvements_en_attente: true,
            });
        }
    };

    _getMouvementsEnAttenteByEmail = async () => {
        var dataPointing = this.props.pointing;
        var mouvements = [];
        var compteur = 0;
        var date = "";
        var heure = "";
        dataPointing.forEach((element) => {
            if (element.email === this.props.email) {
                element.pointage.forEach((pointing) => {
                    date = pointing[2].substring(6, 8) + "/" + pointing[2].substring(4, 6) + "/" + pointing[2].substring(0, 4);
                    heure = pointing[3].substring(0, 2) + "h" + pointing[3].substring(2, 4);
                    mouvements.push({ key: compteur, date: date, heure: heure, ico: "", colorIco: "", loadingMouvement: true });
                    compteur++;
                });
            }
        });
        return mouvements;
    };

    _getUserData = async () => {
        const token = await getToken(this.props.email, this.props.password);
        if (token[0] === 200) {
            const response = await getUser(token[1].token, this.props.email);
            if (response[0] === 200) {
                this.props.nomAction(response[1].user.nom);
                this.props.prenomAction(response[1].user.prenom);
                this.props.langueAction(response[1].user.langue);
                this.setState({
                    loader_list_buttons: false,
                    refreshing: false,
                    user: {
                        email: response[1].user.email,
                        profil: {
                            action0: {
                                active: response[1].user.profil.action_0.active,
                                icoPresent: response[1].user.profil.action_0.ico_present,
                                icoAbsent: response[1].user.profil.action_0.ico_absent,
                                libellePresent: response[1].user.profil.action_0.libelle_present,
                                libelleAbsent: response[1].user.profil.action_0.libelle_absent,
                                localisation: response[1].user.profil.action_0.localisation,
                                activite: response[1].user.profil.action_0.activite,
                                displayPresent: response[1].user.profil.action_0.displayPresent,
                                displayAbsent: response[1].user.profil.action_0.displayAbsent,
                            },
                            action1: {
                                active: response[1].user.profil.action_1.active,
                                icoPresent: response[1].user.profil.action_1.ico_present,
                                icoAbsent: response[1].user.profil.action_1.ico_absent,
                                libellePresent: response[1].user.profil.action_1.libelle_present,
                                libelleAbsent: response[1].user.profil.action_1.libelle_absent,
                                localisation: response[1].user.profil.action_1.localisation,
                                activite: response[1].user.profil.action_1.activite,
                                displayPresent: response[1].user.profil.action_1.displayPresent,
                                displayAbsent: response[1].user.profil.action_1.displayAbsent,
                            },
                            action2: {
                                active: response[1].user.profil.action_2.active,
                                icoPresent: response[1].user.profil.action_2.ico_present,
                                icoAbsent: response[1].user.profil.action_2.ico_absent,
                                libellePresent: response[1].user.profil.action_2.libelle_present,
                                libelleAbsent: response[1].user.profil.action_2.libelle_absent,
                                localisation: response[1].user.profil.action_2.localisation,
                                activite: response[1].user.profil.action_2.activite,
                                displayPresent: response[1].user.profil.action_2.displayPresent,
                                displayAbsent: response[1].user.profil.action_2.displayAbsent,
                            },
                            action3: {
                                active: response[1].user.profil.action_3.active,
                                icoPresent: response[1].user.profil.action_3.ico_present,
                                icoAbsent: response[1].user.profil.action_3.ico_absent,
                                libellePresent: response[1].user.profil.action_3.libelle_present,
                                libelleAbsent: response[1].user.profil.action_3.libelle_absent,
                                localisation: response[1].user.profil.action_3.localisation,
                                activite: response[1].user.profil.action_3.activite,
                                displayPresent: response[1].user.profil.action_3.displayPresent,
                                displayAbsent: response[1].user.profil.action_3.displayAbsent,
                            },
                            action4: {
                                active: response[1].user.profil.action_4.active,
                                icoPresent: response[1].user.profil.action_4.ico_present,
                                icoAbsent: response[1].user.profil.action_4.ico_absent,
                                libellePresent: response[1].user.profil.action_4.libelle_present,
                                libelleAbsent: response[1].user.profil.action_4.libelle_absent,
                                localisation: response[1].user.profil.action_4.localisation,
                                activite: response[1].user.profil.action_4.activite,
                                displayPresent: response[1].user.profil.action_4.displayPresent,
                                displayAbsent: response[1].user.profil.action_4.displayAbsent,
                            },
                            action5: {
                                active: response[1].user.profil.action_5.active,
                                icoPresent: response[1].user.profil.action_5.ico_present,
                                icoAbsent: response[1].user.profil.action_5.ico_absent,
                                libellePresent: response[1].user.profil.action_5.libelle_present,
                                libelleAbsent: response[1].user.profil.action_5.libelle_absent,
                                localisation: response[1].user.profil.action_5.localisation,
                                activite: response[1].user.profil.action_5.activite,
                                displayPresent: response[1].user.profil.action_5.displayPresent,
                                displayAbsent: response[1].user.profil.action_5.displayAbsent,
                            },
                        },
                        client: {
                            activeBadgeClient: response[1].user.client.activeBadge,
                            activeAbsenceClient: response[1].user.client.activeAbsence,
                        },
                        activeBadgeUser: response[1].user.activeBadge,
                        activeAbsenceUser: response[1].user.activeAbsence,
                        activeGeolocalisation: response[1].user.activeLocalisation,
                        lieuxGeolocalisation: response[1].user.lieux,
                        activites: response[1].user.activites,
                    },
                    statut_0: response[1].user.statut0,
                    statut_1: response[1].user.statut1,
                    statut_2: response[1].user.statut2,
                    statut_3: response[1].user.statut3,
                    statut_4: response[1].user.statut4,
                    statut_5: response[1].user.statut5,
                });
            } else {
                await this._refresh("error-unknown");
            }
        } else {
            await this._refresh("error-unknown");
        }
    };

    _getFullHeure = () => {
        var now = new moment().format("HHmmss");
        return now;
    };

    _getFullDate = () => {
        var now = new moment().format("YYYYMMDD");
        return now;
    };

    _refresh = async (selector) => {
        this.setState({
            refreshing: true,
            loader_list_buttons: true,
        });
        const netInfos = await NetInfo.fetch();
        if (selector === "normal") {
            this.setState({
                etat_network: netInfos.isConnected,
            });
            if (!netInfos.isConnected) {
                this._toggleOverlay("no-internet-connection");
                this.setState({
                    refreshing: false,
                    loader_list_buttons: false,
                });
            } else {
                this._getUserData();
                this._getMouvementsEnAttente();
                this._resetCollapse();
            }
        }
        if (selector === "error-unknown") {
            if (!netInfos.isConnected) {
                this._toggleOverlay("no-internet-connection");
            } else {
                this._toggleOverlay("error-unknown");
            }
            this.setState({
                etat_network: false,
            });
            this.setState({
                refreshing: false,
                loader_list_buttons: false,
            });
        }
        if (selector === "error-server-as400") {
            this.setState({
                etat_network: true,
            });
            this.setState({
                refreshing: false,
                loader_list_buttons: false,
            });
        }
    };

    _resetCollapse = () => {
        this.setState({
            expanded_0: false,
            expanded_1: false,
            expanded_2: false,
            expanded_3: false,
            expanded_4: false,
            expanded_5: false,
            render_response: false,
            render_loader: false,
        });
    };

    _toggleCollapse = (button, activite) => {
        this.setState({
            time_fixed: moment().format("LTS"),
            render_loader: true,
            render_response: false,
            render_activites: false,
            render_confirmation: false,
        });
        let render_loader = false;
        let render_activites = false;
        let render_confirmation = false;
        if (button === "F00" || activite === "F") {
            render_confirmation = true;
        } else if (activite === "O") {
            render_activites = true;
        } else {
            render_loader = true;
        }
        this._resetCollapse();
        if (button === "F00") {
            this.setState({
                expanded_0: !this.state.expanded_0,
                expanded_1: false,
                expanded_2: false,
                expanded_3: false,
                expanded_4: false,
                expanded_5: false,
                render_loader: render_loader,
                render_activites: render_activites,
                render_confirmation: render_confirmation,
            });
        }
        if (button === "F01") {
            this.setState({
                expanded_0: false,
                expanded_1: !this.state.expanded_1,
                expanded_2: false,
                expanded_3: false,
                expanded_4: false,
                expanded_5: false,
                render_loader: render_loader,
                render_activites: render_activites,
                render_confirmation: render_confirmation,
            });
        }
        if (button === "F02") {
            this.setState({
                expanded_0: false,
                expanded_1: false,
                expanded_2: !this.state.expanded_2,
                expanded_3: false,
                expanded_4: false,
                expanded_5: false,
                render_loader: render_loader,
                render_activites: render_activites,
                render_confirmation: render_confirmation,
            });
        }
        if (button === "F03") {
            this.setState({
                expanded_0: false,
                expanded_1: false,
                expanded_2: false,
                expanded_3: !this.state.expanded_3,
                expanded_4: false,
                expanded_5: false,
                render_loader: render_loader,
                render_activites: render_activites,
                render_confirmation: render_confirmation,
            });
        }
        if (button === "F04") {
            this.setState({
                expanded_0: false,
                expanded_1: false,
                expanded_2: false,
                expanded_3: false,
                expanded_4: !this.state.expanded_4,
                expanded_5: false,
                render_loader: render_loader,
                render_activites: render_activites,
                render_confirmation: render_confirmation,
            });
        }
        if (button === "F05") {
            this.setState({
                expanded_0: false,
                expanded_1: false,
                expanded_2: false,
                expanded_3: false,
                expanded_4: false,
                expanded_5: !this.state.expanded_5,
                render_loader: render_loader,
                render_activites: render_activites,
                render_confirmation: render_confirmation,
            });
        }
        this._scrollToIndex(button);
        // this.setState({
        //     render_response: false,
        //     render_loader: false,
        // });
    };

    _toggleOverlay = async (selector) => {
        if (selector === "no-internet-connection") {
            this.setState({ visible_modal_no_internet_connection: !this.state.visible_modal_no_internet_connection, text_error_network: traduction("ERROR_NO_INTERNET_CONNECTION", this.props.langue) });
        }
        if (selector === "error-unknown") {
            this.setState({ visible_modal_error_unknown: !this.state.visible_modal_error_unknown, text_error_network: traduction("BUTTON_ERROR_UNKNOWN", this.props.langue) });
        }
    };

    _scrollToIndex = async (button) => {
        let index0 = 0;
        let index1 = 1;
        let index2 = 2;
        let index3 = 3;
        let index4 = 4;
        let index5 = 5;
        if (this.state.mouvements_en_attente) {
            index0 = 1;
            index1 = 2;
            index2 = 3;
            index3 = 4;
            index4 = 5;
            index5 = 6;
        }
        if (button === "F00") {
            this.flatListRef.scrollToIndex({ animated: true, index: index0 });
        }
        if (button === "F01") {
            this.flatListRef.scrollToIndex({ animated: true, index: index1 });
        }
        if (button === "F02") {
            this.flatListRef.scrollToIndex({ animated: true, index: index2 });
        }
        if (button === "F03") {
            this.flatListRef.scrollToIndex({ animated: true, index: index3 });
        }
        if (button === "F04") {
            this.flatListRef.scrollToIndex({ animated: true, index: index4 });
        }
        if (button === "F05") {
            this.flatListRef.scrollToIndex({ animated: true, index: index5 });
        }
    };

    _sendMouvements = async (selector) => {
        var dataPointing = this.props.pointing;
        var compteur_delete = 0;

        this.setState({
            mouvements: await this._getMouvementsEnAttenteByEmail(),
            text_mouvement: traduction("START_SEQUENCE_STATE_SEND_MOVEMENT", this.props.langue),
            disable_bouton_mouvements: true,
        });

        for (const element of dataPointing) {
            if (element.email === this.props.email) {
                if (selector === "normal") {
                    this.setState({
                        visible_modal_mouvements_en_attente: true,
                    });
                } else {
                    this.setState({
                        visible_modal_mouvements_en_attente: false,
                    });
                }

                var compteur = 0;

                for (const pointing of element.pointage) {
                    const token = await getToken(this.props.email, this.props.password);
                    if (token[0] === 200) {
                        const action = await postAction(token[1].token, pointing[0], pointing[1], pointing[2], pointing[3], pointing[4], pointing[5], pointing[6], pointing[7], pointing[8]);
                        if (action[0] === 200) {
                            if (action[1].code === 200) {
                                this.state.mouvements[compteur].ico = "check-circle";
                                this.state.mouvements[compteur].colorIco = "#31859C";
                                this.state.mouvements[compteur].loadingMouvement = false;

                                this.setState({
                                    text_mouvement: traduction("START_STATE_SEND_MOVEMENT", this.props.langue) + (compteur + 1) + traduction("HALF_STATE_SEND_MOVEMENT_SUCCED", this.props.langue),
                                });

                                compteur_delete++;
                                compteur++;
                                if (compteur_delete === element.pointage.length) {
                                    var removeIndex = dataPointing
                                        .map(function (item) {
                                            return item.email;
                                        })
                                        .indexOf(this.props.email);
                                    dataPointing.splice(removeIndex, 1);
                                    this.props.pointingAction(dataPointing);
                                    this.setState({
                                        error_serveur: false,
                                        disable_bouton_mouvements: false,
                                    });
                                }
                                if (selector === "normal") {
                                    this._refresh("normal");
                                }
                            } else {
                                this.state.mouvements[compteur].ico = "times-circle";
                                this.state.mouvements[compteur].colorIco = "#AC6867";
                                this.state.mouvements[compteur].loadingMouvement = false;

                                this.setState({
                                    text_mouvement: traduction("START_STATE_SEND_MOVEMENT", this.props.langue) + (compteur + 1) + traduction("HALF_STATE_SEND_MOVEMENT_FAIL", this.props.langue),
                                });

                                compteur++;

                                if (compteur === element.pointage.length) {
                                    this.setState({
                                        disable_bouton_mouvements: false,
                                    });
                                }
                            }
                        } else {
                            this.state.mouvements[compteur].ico = "times-circle";
                            this.state.mouvements[compteur].colorIco = "#AC6867";
                            this.state.mouvements[compteur].loadingMouvement = false;

                            this.setState({
                                text_mouvement: traduction("START_STATE_SEND_MOVEMENT", this.props.langue) + (compteur + 1) + traduction("HALF_STATE_SEND_MOVEMENT_FAIL", this.props.langue),
                            });

                            compteur++;

                            if (compteur === element.pointage.length) {
                                this.setState({
                                    disable_bouton_mouvements: false,
                                });
                            }
                            if (selector === "normal") {
                                this._refresh("error-unknown");
                            }
                        }
                    } else {
                        this.state.mouvements[compteur].ico = "times-circle";
                        this.state.mouvements[compteur].colorIco = "#AC6867";
                        this.state.mouvements[compteur].loadingMouvement = false;

                        this.setState({
                            text_mouvement: traduction("START_STATE_SEND_MOVEMENT", this.props.langue) + (compteur + 1) + traduction("HALF_STATE_SEND_MOVEMENT_FAIL", this.props.langue),
                            disable_bouton_mouvements: false,
                        });

                        compteur++;

                        if (compteur === element.pointage.length) {
                            this.setState({
                                disable_bouton_mouvements: false,
                            });
                        }

                        if (selector === "normal") {
                            this._refresh("error-unknown");
                        }
                    }
                }
            }
        }
    };

    _startClock = () => {
        this.IntervalClock = setInterval(() => {
            this.setState({
                time: moment().format("LTS"),
            });
        }, 1000);
    };

    _requestLocationPermission = async () => {
        const available = Platform.OS === "ios" ? await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE) : await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        let granted = "";
        if(available !== RESULTS.UNAVAILABLE && RESULTS.DENIED === "denied") {
            granted = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        }
        return granted;
    };

    _errorServeur = async (buttonError, lat, long, activite, lieu, ico) => {
        this.setState({
            loader_list_buttons: false,
            render_loader: false,
            render_response: true,
            activite: null,
            current_ico: ico,
            current_libelle: traduction("TITLE_SERVER_ERROR", this.props.langue),
            current_text: traduction("ERROR_SERVER", this.props.langue),
        });

        if (buttonError === "F00" || activite != null) {
            var dataPointing = this.props.pointing;
            var compteurTrouve = 0;
            for (var i = 0; i < dataPointing.length; i++) {
                if (dataPointing[i].email === this.props.email) {
                    dataPointing[i].pointage.push(["0", this.props.email, this._getFullDate(), this._getFullHeure(), buttonError, lat, long, activite, lieu]);
                    compteurTrouve++;

                    this.props.pointingAction(dataPointing);

                    Vibration.vibrate(500);
                }
            }

            if (compteurTrouve === 0) {
                dataPointing.push({ email: this.props.email, pointage: [["0", this.props.email, this._getFullDate(), this._getFullHeure(), buttonError, lat, long, activite, lieu]] });

                this.props.pointingAction(dataPointing);

                Vibration.vibrate(500);
            }
        } else {
            this.setState({
                current_text: traduction("SERVER_UNAVAILABLE", this.props.langue),
            });
        }
    };

    _testPosition = async () => {
        return new Promise((resolve) => {
            Geolocation.getCurrentPosition((info) => {
                console.log(info)             
                let test_geolocalisation = false;
                let code_lieu = null;
                let latitude = info.coords.latitude.toString();
                let longitude = info.coords.longitude.toString();

                this.state.user.lieuxGeolocalisation.forEach((lieu) => {
                    var dis = getDistance({ latitude: latitude, longitude: longitude }, { latitude: lieu.latitude, longitude: lieu.longitude });
                    if (dis <= lieu.marge) {
                        test_geolocalisation = true;
                        code_lieu = lieu.code;
                    }
                });

                resolve({ test_geolocalisation: test_geolocalisation, code_lieu: code_lieu, longitude: longitude, latitude: latitude });
            },(error) => {
                console.log(error);
            },
            { 
                enableHighAccuracy: false, 
                timeout: 20000, 
                maximumAge: 1000 
            });
        });
    };

    _responseAction = async (action) => {
        let ligne_1 = "";
        let ligne_2 = "";
        let ligne_3 = "";
        let ligne_4 = "";

        ligne_1 = action.message.ligne_1;
        ligne_2 = action.message.ligne_2;
        ligne_3 = action.message.ligne_3;
        ligne_4 = action.message.ligne_4;

        if (ligne_1 !== "") {
            ligne_1 = ligne_1 + "\n";
        }
        if (ligne_2 !== "") {
            ligne_2 = ligne_2 + "\n";
        }
        if (ligne_3 !== "") {
            ligne_3 = ligne_3 + "\n";
        }

        this.setState({
            loader_list_buttons: false,
            render_loader: false,
            render_response: true,
            activite: null,
            statut_0: action.statut0,
            statut_1: action.statut1,
            statut_2: action.statut2,
            statut_3: action.statut3,
            statut_4: action.statut4,
            statut_5: action.statut5,
            current_ico: action.ico,
            current_libelle: action.libelle,
            current_text: ligne_1 + ligne_2 + ligne_3 + ligne_4,
        });
    };

    _sendAction = async (button, libelle, localisation, activite) => {
        this.setState({
            render_loader: true,
            render_confirmation: false,
            render_response: false,
            render_activites: false,
        });

        if (button === "P00") {
            this.setState({
                loader_list_buttons: false,
            });
            const netInfos = await NetInfo.fetch();
            this.setState({
                etat_network: netInfos.isConnected,
            });
            if (!netInfos.isConnected) {
                await this._toggleOverlay("no-internet-connection");
            } else {
                await this._sendMouvements("normal");
            }
        } else if (button === "I00") {
            await this._refresh("normal");
        } else {
            if ((button === "F00" || activite != null) && this.state.mouvements_en_attente) {
                await this._sendMouvements("background");
            }
            const token = await getToken(this.props.email, this.props.password);
            if (token[0] === 200) {
                if (!this.state.user.activeGeolocalisation) {
                    const action = await postAction(token[1].token, "1", this.props.email, this._getFullDate(), this._getFullHeure(), button, null, null, activite, null);
                    if (action[0] === 200) {
                        if (action[1].code === 200) {
                            if (button === "F00") {
                                Vibration.vibrate(500);
                            }
                            await this._responseAction(action[1]);
                            await this._scrollToIndex(button);
                        } else {
                            await this._errorServeur(button, this.state.latitude, this.state.longitude, activite, null, action.ico);
                            await this._scrollToIndex(button);
                        }
                    } else {
                        await this._refresh("error-unknown");
                    }
                } else {
                    if (localisation) {
                        const granted = await this._requestLocationPermission();
                        if (granted === RESULTS.GRANTED) {
                            const test_geolocalisation = await this._testPosition();
                            if (test_geolocalisation.test_geolocalisation) {
                                const action = await postAction(
                                    token[1].token,
                                    "1",
                                    this.props.email,
                                    this._getFullDate(),
                                    this._getFullHeure(),
                                    button,
                                    test_geolocalisation.latitude,
                                    test_geolocalisation.longitude,
                                    activite,
                                    test_geolocalisation.code_lieu
                                );
                                if (action[0] === 200) {
                                    if (action[1].code === 200) {
                                        if (button === "F00") {
                                            Vibration.vibrate(500);
                                        }
                                        await this._responseAction(action[1]);
                                        await this._scrollToIndex(button);
                                    } else {
                                        await this._errorServeur(button, this.state.latitude, this.state.longitude, activite, test_geolocalisation.code_lieu, action.ico);
                                        await this._scrollToIndex(button);
                                    }
                                } else {
                                    await this._refresh("error-unknown");
                                }
                            } else {
                                const action = await postAction(token[1].token, "1", this.props.email, this._getFullDate(), this._getFullHeure(), "E01", test_geolocalisation.latitude, test_geolocalisation.longitude, activite, null);
                                if (action[0] === 200) {
                                    if (action[1].code === 200) {
                                        if (button === "F00") {
                                            Vibration.vibrate(500);
                                        }
                                        await this._responseAction(action[1]);
                                        await this._scrollToIndex(button);
                                    } else {
                                        await this._errorServeur(button, this.state.latitude, this.state.longitude, activite, null, action.ico);
                                        await this._scrollToIndex(button);
                                    }
                                } else {
                                    await this._refresh("error-unknown");
                                }
                            }
                        } else {
                            const action = await postAction(token[1].token, "1", this.props.email, this._getFullDate(), this._getFullHeure(), "E00", null, null, null, null);
                            if (action[0] === 200) {
                                if (action[1].code === 200) {
                                    if (button === "F00") {
                                        Vibration.vibrate(500);
                                    }
                                    await this._responseAction(action[1]);
                                    await this._scrollToIndex(button);
                                } else {
                                    await this._errorServeur(button, null, null, activite, null, action.ico);
                                    await this._scrollToIndex(button);
                                }
                            } else {
                                await this._refresh("error-unknown");
                            }
                        }
                    } else {
                        const action = await postAction(token[1].token, "1", this.props.email, this._getFullDate(), this._getFullHeure(), button, null, null, activite, null);
                        if (action[0] === 200) {
                            if (action[1].code === 200) {
                                if (button === "F00") {
                                    Vibration.vibrate(500);
                                }
                                await this._responseAction(action[1]);
                                await this._scrollToIndex(button);
                            } else {
                                await this._errorServeur(button, null, null, activite, null, action.ico);
                                await this._scrollToIndex(button);
                            }
                        } else {
                            await this._refresh("error-unknown");
                        }
                    }
                }
            } else {
                await this._refresh("error-unknown");
            }
        }
    };

    _renderButtons = (user) => {
        let libelles = [];

        if (this.state.etat_network) {
            if (this.state.mouvements_en_attente) {
                libelles.push({
                    key: 0,
                    libelle: "Envoi des mouvements en attente",
                    ico: "",
                    button: "P00",
                    delay: 0,
                    localisation: this.state.mouvements_en_attente,
                    activite: false,
                    expanded: false,
                    display: true,
                });
            }

            if (user.profil.action0.active) {
                var display_0 = true;
                if (this.state.statut_0) {
                    if (!user.profil.action0.displayPresent) {
                        display_0 = false;
                    }
                    libelles.push({
                        key: 1,
                        libelle: user.profil.action0.libellePresent,
                        ico: user.profil.action0.icoPresent,
                        button: "F00",
                        delay: 0,
                        localisation: user.profil.action0.localisation,
                        activite: user.profil.action0.activite,
                        expanded: this.state.expanded_0,
                        display: display_0,
                    });
                } else {
                    if (!user.profil.action0.displayAbsent) {
                        display_0 = false;
                    }
                    libelles.push({
                        key: 1,
                        libelle: user.profil.action0.libelleAbsent,
                        ico: user.profil.action0.icoAbsent,
                        button: "F00",
                        delay: 0,
                        localisation: user.profil.action0.localisation,
                        activite: user.profil.action0.activite,
                        expanded: this.state.expanded_0,
                        display: display_0,
                    });
                }
            }

            if (user.profil.action1.active) {
                var display_1 = true;
                if (this.state.statut_0) {
                    if (!user.profil.action1.displayPresent) {
                        display_1 = false;
                    }
                } else {
                    if (!user.profil.action1.displayAbsent) {
                        display_1 = false;
                    }
                }
                if (this.state.statut_1) {
                    libelles.push({
                        key: 2,
                        libelle: user.profil.action1.libellePresent,
                        ico: user.profil.action1.icoPresent,
                        button: "F01",
                        delay: 200,
                        localisation: user.profil.action1.localisation,
                        activite: user.profil.action1.activite,
                        expanded: this.state.expanded_1,
                        display: display_1,
                    });
                } else {
                    libelles.push({
                        key: 2,
                        libelle: user.profil.action1.libelleAbsent,
                        ico: user.profil.action1.icoAbsent,
                        button: "F01",
                        delay: 200,
                        localisation: user.profil.action1.localisation,
                        activite: user.profil.action1.activite,
                        expanded: this.state.expanded_1,
                        display: display_1,
                    });
                }
            }

            if (user.profil.action2.active) {
                var display_2 = true;
                if (this.state.statut_0) {
                    if (!user.profil.action2.displayPresent) {
                        display_2 = false;
                    }
                } else {
                    if (!user.profil.action2.displayAbsent) {
                        display_2 = false;
                    }
                }
                if (this.state.statut_2) {
                    libelles.push({
                        key: 3,
                        libelle: user.profil.action2.libellePresent,
                        ico: user.profil.action2.icoPresent,
                        button: "F02",
                        delay: 400,
                        localisation: user.profil.action2.localisation,
                        activite: user.profil.action2.activite,
                        expanded: this.state.expanded_2,
                        display: display_2,
                    });
                } else {
                    libelles.push({
                        key: 3,
                        libelle: user.profil.action2.libelleAbsent,
                        ico: user.profil.action2.icoAbsent,
                        button: "F02",
                        delay: 400,
                        localisation: user.profil.action2.localisation,
                        activite: user.profil.action2.activite,
                        expanded: this.state.expanded_2,
                        display: display_2,
                    });
                }
            }

            if (user.profil.action3.active) {
                var display_3 = true;
                if (this.state.statut_0) {
                    if (!user.profil.action3.displayPresent) {
                        display_3 = false;
                    }
                } else {
                    if (!user.profil.action3.displayAbsent) {
                        display_3 = false;
                    }
                }
                if (this.state.statut_3) {
                    libelles.push({
                        key: 4,
                        libelle: user.profil.action3.libellePresent,
                        ico: user.profil.action3.icoPresent,
                        button: "F03",
                        delay: 600,
                        localisation: user.profil.action3.localisation,
                        activite: user.profil.action3.activite,
                        expanded: this.state.expanded_3,
                        display: display_3,
                    });
                } else {
                    libelles.push({
                        key: 4,
                        libelle: user.profil.action3.libelleAbsent,
                        ico: user.profil.action3.icoAbsent,
                        button: "F03",
                        delay: 600,
                        localisation: user.profil.action3.localisation,
                        activite: user.profil.action3.activite,
                        expanded: this.state.expanded_3,
                        display: display_3,
                    });
                }
            }

            if (user.profil.action4.active) {
                var display_4 = true;
                if (this.state.statut_0) {
                    if (!user.profil.action4.displayPresent) {
                        display_4 = false;
                    }
                } else {
                    if (!user.profil.action4.displayAbsent) {
                        display_4 = false;
                    }
                }
                if (this.state.statut_4) {
                    libelles.push({
                        key: 5,
                        libelle: user.profil.action4.libellePresent,
                        ico: user.profil.action4.icoPresent,
                        button: "F04",
                        delay: 800,
                        localisation: user.profil.action4.localisation,
                        activite: user.profil.action4.activite,
                        expanded: this.state.expanded_4,
                        display: display_4,
                    });
                } else {
                    libelles.push({
                        key: 5,
                        libelle: user.profil.action4.libelleAbsent,
                        ico: user.profil.action4.icoAbsent,
                        button: "F04",
                        delay: 800,
                        localisation: user.profil.action4.localisation,
                        activite: user.profil.action4.activite,
                        expanded: this.state.expanded_4,
                        display: display_4,
                    });
                }
            }

            if (user.profil.action5.active) {
                var display_5 = true;
                if (this.state.statut_0) {
                    if (!user.profil.action5.displayPresent) {
                        display_5 = false;
                    }
                } else {
                    if (!user.profil.action5.displayAbsent) {
                        display_5 = false;
                    }
                }
                if (this.state.statut_5) {
                    libelles.push({
                        key: 6,
                        libelle: user.profil.action5.libellePresent,
                        ico: user.profil.action5.icoPresent,
                        button: "F05",
                        delay: 1000,
                        localisation: user.profil.action5.localisation,
                        activite: user.profil.action5.activite,
                        expanded: this.state.expanded_5,
                        display: display_5,
                    });
                } else {
                    libelles.push({
                        key: 6,
                        libelle: user.profil.action5.libelleAbsent,
                        ico: user.profil.action5.icoAbsent,
                        button: "F05",
                        delay: 1000,
                        localisation: user.profil.action5.localisation,
                        activite: user.profil.action5.activite,
                        expanded: this.state.expanded_5,
                        display: display_5,
                    });
                }
            }
        } else {
            libelles.push({
                key: 0,
                libelle: this.state.text_error_network,
                ico: "",
                button: "I00",
                delay: 0,
                localisation: false,
                activite: false,
                expanded: false,
                display: true,
            });
        }

        return (
            <SafeAreaView>
                <FlatList
                    data={libelles}
                    renderItem={({ item }) =>
                        item.display ? (
                            <Animatable.View animation="bounceIn" delay={item.delay} style={styles.container_button_animation}>
                                <Collapse isExpanded={item.expanded}>
                                    <CollapseHeader>
                                        <TouchableOpacity
                                            onPress={() => {
                                                this._toggleCollapse(item.button, item.activite);
                                                if (item.button !== "F00" && item.activite !== "O" && item.activite !== "F" && !item.expanded) {
                                                    this._sendAction(item.button, item.libelle, item.localisation, null);
                                                }
                                            }}
                                            style={styles.button_tiles}>
                                            <View style={styles.container_ico}>
                                                {item.ico !== "" ? (
                                                    <Image style={styles.image} source={{ uri: `data:image/png;base64,${item.ico}` }} />
                                                ) : (
                                                    <FontAwesome5 style={styles.ico_padding_10} name="exclamation-circle" color="#AC6867" size={40} />
                                                )}
                                                <Text style={styles.text_button}>{item.libelle}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </CollapseHeader>
                                    <CollapseBody style={styles.collapse_button_body}>{this._renderCollapseBody(item)}</CollapseBody>
                                </Collapse>
                            </Animatable.View>
                        ) : null
                    }
                    refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={() => this._refresh("normal")} />}
                    keyExtractor={(item) => item.key}
                    ref={(ref) => (this.flatListRef = ref)}
                />
            </SafeAreaView>
        );
    };

    _renderCollapseBody = (item) => {
        if (item.button === "F00") {
            return (
                <View style={styles.container_loader}>
                    {this._renderLoaderResponse(this.state.render_loader)}
                    {this._renderConfirmation(this.state.render_confirmation, item.button, item.libelle, item.localisation, null)}
                    {this._renderResponse(this.state.render_response, this.state.current_libelle, this.state.current_ico, this.state.current_text, item.button, item.activite)}
                </View>
            );
        } else {
            if (item.activite !== "O" && item.activite !== "F") {
                return (
                    <View style={styles.container_loader}>
                        {this._renderLoaderResponse(this.state.render_loader)}
                        {this._renderResponse(this.state.render_response, this.state.current_libelle, this.state.current_ico, this.state.current_text, item.button, item.activite)}
                    </View>
                );
            }
            if (item.activite === "F") {
                return (
                    <View style={styles.container_loader}>
                        {this._renderLoaderResponse(this.state.render_loader)}
                        {this._renderConfirmation(this.state.render_confirmation, item.button, item.libelle, item.localisation, null)}
                        {this._renderResponse(this.state.render_response, this.state.current_libelle, this.state.current_ico, this.state.current_text, item.button, item.activite)}
                    </View>
                );
            }
            if (item.activite === "O") {
                return (
                    <View style={styles.container_loader}>
                        {this._renderLoaderResponse(this.state.render_loader)}
                        {this._renderActivites(this.state.render_activites)}
                        {this._renderConfirmation(this.state.render_confirmation, item.button, item.libelle, item.localisation, this.state.activite)}
                        {this._renderResponse(this.state.render_response, this.state.current_libelle, this.state.current_ico, this.state.current_text, item.button, item.activite)}
                    </View>
                );
            }
        }
    };

    _renderLoaderResponse = (visible) => {
        if (!visible) {
            return null;
        }
        return <ActivityIndicator size="large" color="#008080" style={styles.container_loader} animating={visible} />;
    };

    _renderActivites = (visible) => {
        if (!visible) {
            return null;
        }
        return (
            <View style={styles.container_overlay}>
                <FlatList
                    data={this.state.user.activites}
                    renderItem={({ item, index }) => (
                        <View style={styles.container_button_animation}>
                            <Button
                                onPress={() => {
                                    this.setState({ render_confirmation: true, render_activites: false, activite: item.code });
                                }}
                                title={item.nom}
                                titleStyle={styles.text_button_tiles_activite}
                                buttonStyle={styles.button_tiles_activite}
                            />
                        </View>
                    )}
                    keyExtractor={(item) => item.code}
                />
                <View style={styles.container_button_animation}>
                    <Button onPress={() => this._resetCollapse()} title={traduction("CANCEL", this.props.langue)} buttonStyle={styles.button_cancel_collapse_activite} />
                </View>
            </View>
        );
    };

    _renderResponse = (visible, libelle, ico, text, button, activite) => {
        if (!visible) {
            return null;
        }
        return (
            <View style={styles.container_overlay}>
                {libelle !== "" ? (
                    <View style={styles.container_titre_response}>
                        <Text style={styles.text_title_overlay}>{libelle}</Text>
                    </View>
                ) : (null)}
                {ico !== "" ? (
                    <View style={styles.container_ico_response}>
                        <Image style={styles.image} source={{ uri: `data:image/png;base64,${ico}` }} />
                    </View>
                ) : (null)}
                <View style={styles.container_text_response}>
                    <Text style={styles.text_body_overlay}>{text}</Text>
                </View>
                <View style={styles.container_button_response}>
                    <Button buttonStyle={styles.button_cancel_collapse} title={traduction("CLOSE", this.props.langue)} onPress={() => this._refresh("normal")} />
                </View>
            </View>
        );
    };

    _renderConfirmation = (visible, button, libelle, localisation, activites) => {
        if (!visible) {
            return null;
        }
        return (
            <View style={styles.view_collapse}>
                <View style={styles.view_flex_direction_row_flex}>
                    <Text style={styles.text_collapse}>{traduction("DATE", this.props.langue)}</Text>
                    <Text>{this._renderTextClock()}</Text>
                </View>
                <View style={styles.view_flex_direction_row_flex}>
                    <Text style={styles.text_collapse}>{traduction("HOUR", this.props.langue)}</Text>
                    <Text>{this.state.time_fixed}</Text>
                </View>
                <View style={styles.view_flex_direction_row_flex}>
                    <Text style={styles.text_collapse}>{traduction("CONFIRMATION", this.props.langue)}</Text>
                    <View style={styles.view_flow_direction_row}>
                        <Button
                            buttonStyle={styles.button_cancel_collapse}
                            title={traduction("CANCEL", this.props.langue)}
                            onPress={() => {
                                this._resetCollapse();
                            }}
                        />
                        <Button
                            buttonStyle={styles.button_validate_collapse}
                            title={traduction("VALIDATE", this.props.langue)}
                            onPress={() => {
                                this._sendAction(button, libelle, localisation, activites);
                            }}
                        />
                    </View>
                </View>
            </View>
        );
    };

    _renderMouvementsEnAttente = () => {
        return (
            <View style={styles.container_overlay}>
                <View style={styles.container_global_header_overlay}>
                    <Animatable.View animation="bounceIn" delay={0} style={styles.container_animation_header_overlay}>
                        <View style={styles.container_title_overlay}>
                            <FontAwesome5 name="arrow-alt-circle-up" color="black" size={50} style={styles.ico_margin_10} />
                            <Text style={styles.text_title_overlay_mouvement}>{traduction("TITLE_SEND_MOVEMENT", this.props.langue)}</Text>
                        </View>
                    </Animatable.View>
                    <View style={styles.container_global_tiles_overlay}>
                        <Animatable.View animation="bounceIn" delay={300} style={styles.container_animation_overlay_text}>
                            <View style={styles.container_mouvement_overlay}>
                                <FlatList
                                    data={this.state.mouvements}
                                    renderItem={({ item }) => (
                                        <View style={styles.container_list_mouvement}>
                                            {item.loadingMouvement ? (
                                                <ActivityIndicator color="#008080" style={styles.indicator_padding_horizontal_10} />
                                            ) : (
                                                <FontAwesome5 name={item.ico} color={item.colorIco} size={20} style={styles.indicator_padding_horizontal_10} />
                                            )}
                                            <Text style={styles.text_mouvement_overlay}>
                                                {traduction("START_LIST_SEND_MOVEMENT", this.props.langue)} {item.date} {traduction("HALF_LIST_SEND_MOVEMENT", this.props.langue)} {item.heure}
                                            </Text>
                                        </View>
                                    )}
                                />
                            </View>
                        </Animatable.View>
                        <Animatable.View animation="bounceIn" delay={600} style={styles.container_animation_overlay_ico}>
                            <View style={styles.container_ico_overlay}>
                                <Text style={styles.text_mouvement_overlay}>{this.state.text_mouvement}</Text>
                            </View>
                        </Animatable.View>
                        <Button disabled={this.state.disable_bouton_mouvements} buttonStyle={styles.button_overlay_refuse} title={traduction("CLOSE", this.props.langue)} onPress={() => this.setState({ visible_modal_mouvements_en_attente: false })} />
                    </View>
                </View>
            </View>
        );
    };

    _renderStatusBar = () => {
        return <StatusBar backgroundColor="#31859C" barStyle="light-content" />;
    };

    _renderWelcomeText = () => {
        return (
            <Animatable.View animation="slideInLeft">
                <Text style={styles.text_welcome}>
                    {traduction("WELCOME", this.props.langue)}
                    <Text style={styles.text_welcome_name}>
                        {this.props.prenom} {this.props.nom}
                    </Text>
                </Text>
            </Animatable.View>
        );
    };

    _renderTextClock = () => {
        let momentPlugin = new moment();
        let intDay = momentPlugin.format("d");
        let intMonth = momentPlugin.format("M");
        let dayOfMonth = momentPlugin.format("D");
        let year = momentPlugin.format("YYYY");
        let day = "";
        let month = "";
        let fullDate = "";
        let days = traduction("DAYS", this.props.langue);
        let months = traduction("MONTHS", this.props.langue);
        if (intDay === "1") {
            day = days[0];
        }
        if (intDay === "2") {
            day = days[1];
        }
        if (intDay === "3") {
            day = days[2];
        }
        if (intDay === "4") {
            day = days[3];
        }
        if (intDay === "5") {
            day = days[4];
        }
        if (intDay === "6") {
            day = days[5];
        }
        if (intDay === "7") {
            day = days[6];
        }
        if (intMonth === "1") {
            month = months[0];
        }
        if (intMonth === "2") {
            month = months[1];
        }
        if (intMonth === "3") {
            month = months[2];
        }
        if (intMonth === "4") {
            month = months[3];
        }
        if (intMonth === "5") {
            month = months[4];
        }
        if (intMonth === "6") {
            month = months[5];
        }
        if (intMonth === "7") {
            month = months[6];
        }
        if (intMonth === "8") {
            month = months[7];
        }
        if (intMonth === "9") {
            month = months[8];
        }
        if (intMonth === "10") {
            month = months[9];
        }
        if (intMonth === "11") {
            month = months[10];
        }
        if (intMonth === "12") {
            month = months[11];
        }
        fullDate = day + " " + dayOfMonth + " " + month + " " + year;
        return fullDate;
    };

    _renderClock = () => {
        const fullDate = this._renderTextClock();
        return (
            <Animatable.View animation="bounceIn">
                <Text style={styles.text_date}>{fullDate}</Text>
                <Text style={styles.text_heure}>{this.state.time}</Text>
            </Animatable.View>
        );
    };

    _renderLoader = () => {
        return <ActivityIndicator size="large" color="#008080" style={styles.container_loader} />;
    };

    _renderModal = (selector) => {
        if (selector === "no-internet-connection") {
            return (
                <View style={styles.view_overlay}>
                    <Text style={styles.text_overlay}>{traduction("NO_INTERNET_CONNECTION", this.props.langue)}</Text>
                    <View style={styles.view_button_overlay}>
                        <Button buttonStyle={styles.button_overlay_accept} title={traduction("CLOSE", this.props.langue)} onPress={() => this._toggleOverlay("no-internet-connection")} />
                    </View>
                </View>
            );
        }
        if (selector === "error-unknown") {
            return (
                <View style={styles.view_overlay}>
                    <Text style={styles.text_overlay}>{traduction("ERROR_UNKNOWN", this.props.langue)}</Text>
                    <View style={styles.view_button_overlay}>
                        <Button buttonStyle={styles.button_overlay_accept} title={traduction("CLOSE", this.props.langue)} onPress={() => this._toggleOverlay("error-unknown")} />
                    </View>
                </View>
            );
        }
    };

    render() {
        return (
            <View style={styles.container}>
                {this._renderStatusBar()}
                <View style={styles.container}>
                    <View style={styles.container_global_header}>
                        <View style={styles.container_global_header_welcome}>{this._renderWelcomeText()}</View>
                        <View style={styles.container_global_header_date}>{this._renderClock()}</View>
                    </View>
                    <View style={styles.container_global_tiles}>{this.state.loader_list_buttons ? this._renderLoader() : this._renderButtons(this.state.user)}</View>
                </View>
                <Overlay isVisible={this.state.visible_modal_error_unknown} overlayStyle={styles.overlay_margin_10}>
                    {this._renderModal("error-unknown")}
                </Overlay>
                <Overlay isVisible={this.state.visible_modal_no_internet_connection} overlayStyle={styles.overlay_margin_10}>
                    {this._renderModal("no-internet-connection")}
                </Overlay>
                <Overlay isVisible={this.state.visible_modal_mouvements_en_attente} overlayStyle={styles.overlay_margin_10}>
                    {this._renderMouvementsEnAttente()}
                </Overlay>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    container_loader: {
        flex: 1,
    },
    container_clock: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    container_title_overlay: {
        flex: 1,
        padding: 15,
        backgroundColor: "white",
        elevation: 5,
        borderRadius: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    container_animation_header_overlay: {
        flex: 1,
        paddingTop: 20,
        padding: 10,
    },
    container_global_tiles: {
        flex: 4,
    },
    container_global_tiles_overlay: {
        flex: 3,
    },
    container_global_header_welcome: {
        flex: 1,
        paddingLeft: 20,
        paddingTop: 20,
    },
    container_global_header: {
        flex: Platform.OS === 'ios' ? 1.5 : 2,
    },
    container_global_header_date: {
        flex: 2,
    },
    container_global_header_overlay: {
        flex: 1,
    },
    container_button_animation: {
        flex: 1,
        margin: 10,
        elevation: 5,
        backgroundColor: "white",
        borderRadius: 0,
        borderWidth: 1,
        borderColor: "#D0D0D0",
    },
    container_animation_overlay: {
        flex: 1,
        padding: 10,
    },
    container_animation_overlay_ico: {
        flex: 1,
        padding: 10,
    },
    container_animation_overlay_text: {
        flex: 2,
        padding: 10,
    },
    container_list_mouvement: {
        flex: 2,
        padding: 0,
        flexDirection: "row",
        alignItems: "center",
    },
    container_ico: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    container_overlay: {
        flex: 1,
    },
    container_text_activite: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#008080",
        height: 60,
        marginBottom: 1,
    },
    text_activite: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white",
    },
    collapse_button_body: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#D0D0D0",
        padding: 20,
        margin: 10,
    },
    container_ico_overlay: {
        padding: 20,
        backgroundColor: "white",
        elevation: 5,
        borderRadius: 0,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    container_text_overlay: {
        padding: 20,
        backgroundColor: "white",
        elevation: 5,
        borderRadius: 5,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    container_mouvement_overlay: {
        padding: 15,
        backgroundColor: "white",
        elevation: 5,
        borderRadius: 0,
        flex: 1,
        justifyContent: "center",
    },
    container_titre_response: {
        flex: 1,
        fontSize: 20,
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 5,
    },
    container_ico_response: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    container_text_response: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    container_button_response: {
        flexDirection: "row",
        paddingHorizontal: 10,
        paddingTop: 5,
    },
    image: {
        height: 50,
        width: 50,
        padding: 10,
        marginRight: 30,
    },
    ico_overlay: {
        height: 50,
        width: 50,
        padding: 20,
    },
    text_date: {
        textAlign: "center",
        fontSize: 20,
    },
    text_errorServeur: {
        textAlign: "center",
        color: "#AC6867",
        fontSize: 18,
    },
    text_heure: {
        textAlign: "center",
        fontSize: 35,
        padding: 10,
    },
    text_welcome: {
        fontSize: 20,
    },
    text_welcome_name: {
        fontWeight: "bold",
    },
    text_collapse: {
        fontWeight: "bold",
        width: 100,
    },
    dialog: {
        textAlign: "center",
    },
    dialog_content: {
        alignItems: "center",
    },
    spinnerTextStyle: {
        color: "#FFF",
    },
    text_title_overlay_mouvement: {
        fontSize: 17,
    },
    text_title_overlay: {
        fontWeight: "bold",
        fontSize: 17,
    },
    text_body_overlay: {
        fontSize: 17,
    },
    text_mouvement_overlay: {
        textAlign: "center",
        fontSize: 17,
    },
    text_envoi_hors_ligne: {
        fontSize: 20,
        textAlign: "center",
        color: "white",
    },
    text_button: {
        fontSize: 17,
        paddingRight: 20,
    },
    buttons_list_activites: {
        padding: 20,
        backgroundColor: "#16A085",
        elevation: 5,
        borderRadius: 5,
    },
    button_overlay_accept: {
        borderRadius: 0,
        backgroundColor: "#62B554",
        marginVertical: 10,
        marginHorizontal: 10,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: "#D0D0D0",
    },
    button_overlay_refuse: {
        borderRadius: 0,
        backgroundColor: "#AC6867",
        marginVertical: 10,
        marginHorizontal: 10,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: "#D0D0D0",
    },
    button_cancel_collapse: {
        marginRight: 5,
        paddingHorizontal: 10,
        backgroundColor: "#AC6867",
        borderRadius: 0,
        borderWidth: 1,
        borderColor: "#D0D0D0",
    },
    button_validate_collapse: {
        marginLeft: 5,
        paddingHorizontal: 10,
        backgroundColor: "#62B554",
        borderRadius: 0,
        borderWidth: 1,
        borderColor: "#D0D0D0",
    },
    loader_overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    overlay_padding_0: {
        padding: 0,
    },
    overlay_margin_10: {
        margin: 10,
    },
    ico_padding_10: {
        padding: 10,
    },
    ico_margin_10: {
        marginBottom: 10,
    },
    indicator_padding_horizontal_10: {
        paddingRight: 10,
    },
    view_collapse: {
        flex: 1,
        justifyContent: "center",
    },
    view_collapse_flex_2: {
        flex: 2,
        justifyContent: "center",
    },
    view_flow_direction_row: {
        flexDirection: "row",
    },
    view_flex_direction_row_flex: {
        flex: 1,
        flexDirection: "row",
        paddingVertical: 5,
        alignItems: "center",
    },
    button_tiles_activite: {
        backgroundColor: "white",
    },
    button_cancel_collapse_activite: {
        backgroundColor: "#AC6867",
    },
    text_button_tiles_activite: {
        color: "black",
    },
    button_tiles: {
        padding: 20,
    },
    view_overlay: {
        padding: 20,
    },
    text_overlay: {
        marginBottom: 20,
        fontSize: 15,
    },
    view_button_overlay: {
        flexDirection: "row",
        justifyContent: "center",
    },
});

const mapStateToProps = (state) => {
    return {
        email: state.emailReducer.email,
        password: state.passwordReducer.password,
        pointing: state.pointingReducer.pointing,
        emails: state.listeEmailReducer.emails,
        langue: state.langueReducer.langue,
        nom: state.nomReducer.nom,
        prenom: state.prenomReducer.prenom,
    };
};

export default connect(mapStateToProps, { listeEmailAction, pointingAction, nomAction, prenomAction, emailAction, passwordAction, langueAction })(ManagementTime);
