const userRepository = require('../repositories/userRepository');
const { verifyPassword } = require('../utils/passwordVerifier');

class AuthService {
  /**
   * Realiza login autenticando o usuário contra a tabela USERS do Oracle
   * 
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<object>}
   */
  async login(email, password) {
    if (!email || !password) {
      const error = new Error('E-mail e senha são obrigatórios.');
      error.status = 400;
      throw error;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await userRepository.findByEmail(cleanEmail);

    if (!user) {
      const error = new Error('Credenciais inválidas.');
      error.status = 401;
      throw error;
    }

    const isValid = verifyPassword(password, user.userPassword);
    if (!isValid) {
      const error = new Error('Credenciais inválidas.');
      error.status = 401;
      throw error;
    }

    const roles = {
      isPassenger: user.userPassanger === 1,
      isDriver: user.userDriver === 1,
      isOperator: user.userOperator === 1,
    };

    return {
      user: {
        userId: user.userId,
        userName: user.userName,
        userEmail: user.userEmail,
        roles,
      },
    };
  }

  /**
   * Obtém os dados do perfil do usuário por ID
   * @param {string} userId 
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('Usuário não encontrado.');
      error.status = 404;
      throw error;
    }

    return {
      userId: user.userId,
      userName: user.userName,
      userEmail: user.userEmail,
      roles: {
        isPassenger: user.userPassanger === 1,
        isDriver: user.userDriver === 1,
        isOperator: user.userOperator === 1,
      },
    };
  }
}

module.exports = new AuthService();
