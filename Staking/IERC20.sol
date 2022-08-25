// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    // Сумма всех токенов
    function totalSupply() external view returns (uint256);

    // Сумма всех токенов на аккаутне
    function balanceOf(address account) external view returns (uint256);

    /** 
     * Перемещаем `amount` токена от caller'а к `recipient`.
     *
     * возвращает булевое при выполнении
     *
     * Emits a {Transfer} событие.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * Возвращаем количство токенов `spender` разрешены `owner` для операций через {transferFrom}. 0 по умолчанию
     * Менятеся число когда вызваны {approve} или {transferFrom}
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * Устанавливает `amount` как allowance(разрашение) `spender`а на разрешение владельца.
     *
     * Возвращает булевое при выполнении
     *
     * Важно: Изменение allowance этим методом может повлечь, что ктото может исползовать старые и новые
     * allowance через невезучие заказы транзакций
     * Решение: уменьшить allowance 'spender'а до 0, и установить желаемое значение позже:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} событие.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * Перемещает `amount` токены из `sender` к `recipient` использую механизм allowance.
     * `amount` потом вычитается allowance из суммы caller'a
     *
     * Возвращает булевое при выполнении
     *
     * Emits a {Transfer} событие.
     */
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    /**
     * Emitted когда `value` токены перемещаются из одного аккаунта (`from`) к другому (`to`).
     *
     * `value` может быть 0.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * Emitted когда allowance `spender`а для `owner` установлен вызовом {approve}.
     * `value` новый alowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}